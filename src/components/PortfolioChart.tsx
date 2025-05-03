import React, { useState, useEffect, useCallback, useRef } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

// Types
interface PortfolioDataPoint {
  date: string;
  price: number;
}

interface PortfolioData {
  dates: string[];
  prices: number[];
}

interface ChartProps {
  onHover: (point: { price: number; date: string } | null) => void;
}

interface InnerChartProps {
  data: PortfolioDataPoint[];
  onHover: (point: { price: number; date: string } | null) => void;
}

// Chart renderer with mouse following indicator
const ChartRenderer: React.FC<InnerChartProps> = ({ data, onHover }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [activePoint, setActivePoint] = useState<{index: number, price: number, date: string} | null>(null);
  const [blinkVisible, setBlinkVisible] = useState(true);
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  // Prepare data for chart
  const chartData = [...data].map(item => ({
    ...item,
    formattedDate: formatDate(item.date)
  }));

  // Use Robinhood green or red based on price trend
  const startPrice = chartData[0]?.price || 0;
  const endPrice = chartData[chartData.length - 1]?.price || 0;
  const lineColor = endPrice >= startPrice ? "rgb(0, 200, 5)" : "#ff5000";

  // Blink animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinkVisible(prev => !prev);
    }, 600); // Blink every 600ms
    
    return () => clearInterval(blinkInterval);
  }, []);

  // Draw chart on canvas
  useEffect(() => {
    if (!canvasRef.current || chartData.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Find min and max prices for scaling
    const prices = chartData.map(d => d.price);
    const minPrice = Math.min(...prices) * 0.99; // Add some padding
    const maxPrice = Math.max(...prices) * 1.01;
    const priceRange = maxPrice - minPrice;
    
    // Padding
    const leftPadding = 10;
    const rightPadding = 20;
    const topPadding = 20;
    const bottomPadding = 20;
    const chartWidth = canvas.width - (leftPadding + rightPadding);
    const chartHeight = canvas.height - (topPadding + bottomPadding);
    
    // Draw dashed line at the bottom
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 0.5;
    ctx.setLineDash([4, 4]); // Create dashed line
    ctx.moveTo(leftPadding, topPadding + chartHeight);
    ctx.lineTo(leftPadding + chartWidth, topPadding + chartHeight);
    ctx.stroke();
    
    // Reset dash for main line
    ctx.setLineDash([]);
    
    // Draw main line
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.5; // Thinner line like Robinhood
    
    chartData.forEach((dataPoint, i) => {
      const x = leftPadding + (i / (chartData.length - 1)) * chartWidth;
      const y = topPadding + chartHeight - ((dataPoint.price - minPrice) / priceRange) * chartHeight;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();

    // Draw blinking end point
    if (blinkVisible && chartData.length > 0) {
      const lastPoint = chartData[chartData.length - 1];
      const x = leftPadding + chartWidth;
      const y = topPadding + chartHeight - ((lastPoint.price - minPrice) / priceRange) * chartHeight;
      
      ctx.beginPath();
      ctx.fillStyle = lineColor;
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw hover line and dot if mouse is over the chart
    if (mouseX !== null && activePoint !== null) {
      const index = activePoint.index;
      const x = leftPadding + (index / (chartData.length - 1)) * chartWidth;
      const y = topPadding + chartHeight - ((chartData[index].price - minPrice) / priceRange) * chartHeight;
      
      // Draw vertical line
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.68)";
      ctx.lineWidth = 0.2;
      ctx.moveTo(x, topPadding);
      ctx.lineTo(x, topPadding + chartHeight);
      ctx.stroke();
      
      // Draw dot at the price point
      ctx.beginPath();
      ctx.fillStyle = lineColor;
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [chartData, lineColor, mouseX, activePoint, blinkVisible]);

  // Handle mouse move on canvas
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current || chartData.length === 0 || !containerRef.current) return;
    
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    setMouseX(mouseX);
    
    // Calculate which data point is closest
    const leftPadding = 10;
    const rightPadding = 20;
    const chartWidth = canvas.width - (leftPadding + rightPadding);
    const relativeX = mouseX / container.offsetWidth;
    const dataIndex = Math.min(
      Math.max(
        Math.round(relativeX * (chartData.length - 1)),
        0
      ),
      chartData.length - 1
    );
    
    const point = {
      index: dataIndex,
      price: chartData[dataIndex].price,
      date: chartData[dataIndex].formattedDate
    };
    
    setActivePoint(point);
    onHover({
      price: point.price,
      date: point.date
    });
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setMouseX(null);
    setActivePoint(null);
    onHover(null);
  };

  return (
    <div 
      ref={containerRef}
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '500px',
        cursor: 'crosshair'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <canvas
        ref={canvasRef}
        width={800}
        height={300}
        style={{ width: '100%', height: '100%' }}
      />
      
      {mouseX !== null && activePoint !== null && (
        <div 
          style={{
            position: 'absolute',
            top: '10px',
            left: `${mouseX}px`,
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'rgba(255, 255, 255, 0.9)',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            pointerEvents: 'none',
            whiteSpace: 'nowrap'
          }}
        >
          {activePoint.date}
        </div>
      )}
    </div>
  );
};

// Main Portfolio Chart Component
const PortfolioChart: React.FC<ChartProps> = ({ onHover }) => {
  const [timeframe, setTimeframe] = useState<string>("1D");
  const [portfolioData, setPortfolioData] = useState<PortfolioDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Retrieve Alpaca credentials from Firestore
  const [alpacaKey, setAlpacaKey] = useState<string>("");
  const [alpacaSecret, setAlpacaSecret] = useState<string>("");

  useEffect(() => {
    const fetchAlpacaCredentials = async () => {
      if (!auth.currentUser) return;
      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setAlpacaKey(data.alpacaKey || "");
          setAlpacaSecret(data.alpacaSecret || "");
        }
      } catch (err) {
        console.error("Error fetching Alpaca credentials:", err);
      }
    };
    fetchAlpacaCredentials();
  }, []);

  // Get the timeframe parameter based on selected timeframe
  const getTimeframeParam = (tf: string) => {
    switch(tf) {
      case "1D": return "15Min";
      case "1W": return "1H";
      case "1M":
      case "3M":
      case "1Y":
      case "ALL":
        return "1D";
      default: return "15Min";
    }
  };

  // Get the period parameter based on selected timeframe
  const getPeriodParam = (tf: string) => {
    switch(tf) {
      case "1D": return "1D";
      case "1W": return "1W";
      case "1M": return "1M";
      case "3M": return "3M";
      case "1Y": return "12M";
      case "ALL": return "1A";
      default: return "D";
    }
  };

  // Fetch portfolio data based on selected timeframe
  const fetchPortfolioData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Ensure Alpaca credentials are available
    if (!alpacaKey || !alpacaSecret) {
      setError("Missing Alpaca credentials.");
      setLoading(false);
      return;
    }
    
    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      const period = getPeriodParam(timeframe);
      const tfParam = getTimeframeParam(timeframe);
      
      const endpoint = `${import.meta.env.VITE_PROXY_API_BASE_URL}/portfolio?apikey=${alpacaKey}&secret=${alpacaSecret}&period=${period}&timeframe=${tfParam}`;
      
      const response = await fetch(endpoint, {
        signal: abortControllerRef.current.signal
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch portfolio data: ${response.statusText}`);
      }
      
      const data: PortfolioData = await response.json();
      
      // Transform the data into the format we need
      const transformedData = data.dates.map((date, index) => ({
        date,
        price: data.prices[index]
      }));
      
      setPortfolioData(transformedData);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error("Error fetching portfolio data:", err);
        setError("Failed to load chart data. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }, [timeframe, alpacaKey, alpacaSecret]);

  // Fetch data when timeframe or credentials change
  useEffect(() => {
    fetchPortfolioData();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [fetchPortfolioData]);

  // Handle timeframe button clicks
  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
  };

  return (
    <div style={{ width: "100%", padding: 0 }}>
      {/* Chart container */}
      <div style={{ position: "relative" }}>
        {loading ? (
          <div style={{ height: "500px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{
              width: '30px',
              height: '30px',
              margin: '20px auto',
              borderRadius: '50%',
              border: '3px solid rgba(204, 247, 89, 0.2)',
              borderTopColor: 'rgba(204, 247, 89, 1)',
              animation: 'spin 1s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          <div style={{ height: "500px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff6b6b" }}>
            {error}
          </div>
        ) : (
          <ChartRenderer data={portfolioData} onHover={onHover} />
        )}
      </div>
      
      {/* Timeframe selector */}
      <div style={{ 
        display: "flex", 
        justifyContent: "left", 
        marginTop: "20px",
        gap: "30px" 
      }}>
        {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map(tf => (
          <button
            key={tf}
            onClick={() => handleTimeframeChange(tf)}
            style={{
              background: timeframe === tf ? "rgb(0, 200, 5)" : "transparent",
              color: timeframe === tf ? "#000" : "#fff",
              border: "none",
              padding: "5px 10px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.9rem"
            }}
          >
            {tf}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PortfolioChart;
