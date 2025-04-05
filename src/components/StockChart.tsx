import React, { useState, useEffect, useCallback, useRef } from "react";

// Types
interface StockDataPoint {
  symbol: string;
  date: string;
  price: number;
  volume: number;
}

interface ChartProps {
  symbol: string;
  onHover: (point: { price: number; date: string } | null) => void;
}

interface InnerChartProps {
  data: StockDataPoint[];
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

  // Prepare data for chart (reversed to show oldest to newest)
  const chartData = [...data]
    .reverse()
    .map(item => ({
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
    
    // Padding - reduced but not fully removed left padding for alignment
    const leftPadding = 10; // Small left padding to align with text
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
        height: '300px',
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

// Main Chart Component
const StockChart: React.FC<ChartProps> = ({ symbol, onHover }) => {
  const [timeframe, setTimeframe] = useState<string>("ALL"); // Changed default from "1Y" to "ALL"
  const [stockData, setStockData] = useState<StockDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch stock data based on selected timeframe
  const fetchStockData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // For demo purposes, we're using the same endpoint for all timeframes
      const endpoint = `https://proxy-server-532651853525.us-west2.run.app/day/${symbol}`;
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Failed to fetch stock data: ${response.statusText}`);
      }
      
      const data: StockDataPoint[] = await response.json();
      setStockData(data);
    } catch (err) {
      console.error("Error fetching stock data:", err);
      setError("Failed to load chart data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [symbol, timeframe]);

  useEffect(() => {
    fetchStockData();
  }, [fetchStockData]);

  // Handle timeframe button clicks
  const handleTimeframeChange = (newTimeframe: string) => {
    if (newTimeframe === "ALL") { // Updated to accept "ALL" instead of "1Y"
      setTimeframe(newTimeframe);
    } else {
      // For demo purposes, other timeframes show "Coming Soon"
      alert("Coming soon: " + newTimeframe + " timeframe");
    }
  };

  return (
    <div style={{ width: "100%", padding: 0 }}>
      {/* Chart container */}
      <div style={{ position: "relative" }}>
        {loading ? (
          <div style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            Loading chart...
          </div>
        ) : error ? (
          <div style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff6b6b" }}>
            {error}
          </div>
        ) : (
          <ChartRenderer data={stockData} onHover={onHover} />
        )}
      </div>
      
      {/* Timeframe selector */}
      <div style={{ 
        display: "flex", 
        justifyContent: "left", 
        marginTop: "20px",
        gap: "30px" 
      }}>
        {["LIVE", "1D", "1W", "1M", "3M", "YTD", "1Y", "ALL"].map((tf) => (
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

export default StockChart;