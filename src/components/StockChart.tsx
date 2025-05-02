import React, { useState, useEffect, useCallback, useRef } from "react";

// Types
type StockDataPoint = {
  symbol: string;
  date: string;
  price: number;
  volume: number;
};

interface ChartProps {
  symbol: string;
  onHover: (point: { price: number; date: string } | null) => void;
}

interface InnerChartProps {
  data: StockDataPoint[];
  onHover: (point: { price: number; date: string } | null) => void;
}

// Chart rendering component
const ChartRenderer: React.FC<InnerChartProps> = ({ data, onHover }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [activePoint, setActivePoint] = useState<{ index: number; price: number; date: string } | null>(null);
  const [blinkVisible, setBlinkVisible] = useState(true);

  // Format date
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  // Prepare chart data (oldest → newest)
  const chartData = [...data].reverse().map((pt) => ({
    ...pt,
    formattedDate: formatDate(pt.date),
  }));



  // Trend color
  const startPrice = chartData[0]?.price ?? 0;
  const endPrice = chartData[chartData.length - 1]?.price ?? 0;
  const lineColor = endPrice >= startPrice ? "rgb(0, 200, 5)" : "#ff5000";

  // Blink effect
  useEffect(() => {
    const id = setInterval(() => setBlinkVisible((v) => !v), 600);
    return () => clearInterval(id);
  }, []);

  // Drawing logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || chartData.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const prices = chartData.map((d) => d.price);
    const minPrice = Math.min(...prices) * 0.99;
    const maxPrice = Math.max(...prices) * 1.01;
    const range = maxPrice - minPrice;


    const padding = { left: 10, right: 20, top: 20, bottom: 20 };
    const cW = width - (padding.left + padding.right);
    const cH = height - (padding.top + padding.bottom);

    // Baseline
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.moveTo(padding.left, padding.top + cH);
    ctx.lineTo(padding.left + cW, padding.top + cH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Main line
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.5;
    chartData.forEach((pt, i) => {
      const x = padding.left + (i / (chartData.length - 1)) * cW;
      const y = padding.top + cH - ((pt.price - minPrice) / range) * cH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Blink endpoint
    if (blinkVisible) {
      const last = chartData[chartData.length - 1];
      const x = padding.left + cW;
      const y = padding.top + cH - ((last.price - minPrice) / range) * cH;
      ctx.beginPath();
      ctx.fillStyle = lineColor;
      ctx.arc(x, y, 2.5, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Hover
    if (mouseX !== null && activePoint !== null) {
      const idx = activePoint.index;
      const x = padding.left + (idx / (chartData.length - 1)) * cW;
      const y = padding.top + cH - ((chartData[idx].price - minPrice) / range) * cH;

      ctx.beginPath();
      ctx.strokeStyle = "rgba(255,255,255,0.68)";
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + cH);
      ctx.stroke();

      ctx.beginPath();
      ctx.fillStyle = lineColor;
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, [chartData, lineColor, mouseX, activePoint, blinkVisible]);

  // Mouse handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const box = containerRef.current?.getBoundingClientRect();
    if (!box || chartData.length === 0) return;
    const x = e.clientX - box.left;
    setMouseX(x);

    const ratio = x / box.width;
    const idx = Math.round(ratio * (chartData.length - 1));
    const clamped = Math.min(Math.max(idx, 0), chartData.length - 1);
    const pt = chartData[clamped];
    setActivePoint({ index: clamped, price: pt.price, date: pt.formattedDate });
    onHover({ price: pt.price, date: pt.formattedDate });
  };

  const handleMouseLeave = () => {
    setMouseX(null);
    setActivePoint(null);
    onHover(null);
  };

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", height: "350px", cursor: "crosshair" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <canvas ref={canvasRef} width={800} height={350} style={{ width: "100%", height: "100%" }} />
      {mouseX !== null && activePoint !== null && (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: `${mouseX}px`,
            transform: "translateX(-50%)",
            backgroundColor: "rgba(0,0,0,0.7)",
            color: "#fff",
            padding: "4px 8px",
            borderRadius: 4,
            fontSize: "0.75rem",
            pointerEvents: "none",
          }}
        >
          {activePoint.date}
        </div>
      )}
    </div>
  );
};

// Main StockChart component
const StockChart: React.FC<ChartProps> = ({ symbol, onHover }) => {
  const [timeframe, setTimeframe] = useState<string>("ALL");
  const [stockData, setStockData] = useState<StockDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStockData = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const baseUrl = `${import.meta.env.VITE_PROXY_API_BASE_URL}`;
    let endpoint: string;
    switch (timeframe) {
      case 'LIVE':
      case '1D':
        endpoint = `${baseUrl}/historical-data/5min/${symbol}`;
        break;
      case '1W':
        endpoint = `${baseUrl}/historical-data/30min/${symbol}`;
        break;
      default:
        endpoint = `${baseUrl}/day/${symbol}`;
    }


    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(response.statusText);
    const rawData: any[] = await response.json();

    // Normalize data: use 'close' for intraday or 'price' for daily
    const normalized: StockDataPoint[] = rawData.map(d => ({
      symbol,
      date: d.date,
      price: d.close ?? d.price,
      volume: d.volume
    }));


    const now = new Date();
    let filtered = normalized;
    if (timeframe === 'LIVE') filtered = normalized.slice(0, 80);
    else if (timeframe === '1M') filtered = normalized.slice(0, 30);
    else if (timeframe === '3M') filtered = normalized.slice(0, 90);
    else if (timeframe === 'YTD') {
      filtered = normalized.filter(d => new Date(d.date) >= new Date(now.getFullYear(), 0, 1));
    } else if (timeframe === '1Y') {
      const past = new Date(now);
      past.setDate(past.getDate() - 365);
      filtered = normalized.filter(d => new Date(d.date) >= past);
    }

    setStockData(filtered);
  } catch (err) {
    console.error(err);
    setError('Failed to load chart data. Try again later.');
  } finally {
    setLoading(false);
  }
}, [symbol, timeframe]);

  useEffect(() => {
    fetchStockData();
  }, [fetchStockData]);

  return (
    <div style={{ width: "100%" }}>
      <div style={{ position: "relative" }}>
        {loading ? (
          <div style={{ height: 350, display: "flex", alignItems: "center", justifyContent: "center" }}>
            Loading chart...
          </div>
        ) : error ? (
          <div style={{ height: 350, display: "flex", alignItems: "center", justifyContent: "center", color: "#ff6b6b" }}>
            {error}
          </div>
        ) : (
          <ChartRenderer data={stockData} onHover={onHover} />
        )}
      </div>

      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        {["LIVE", "1D", "1W", "1M", "3M", "YTD", "1Y", "ALL"].map(tf => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            style={{
              background: timeframe === tf ? "rgb(0,200,5)" : "transparent",
              color: timeframe === tf ? "#000" : "#fff",
              border: "none",
              padding: "6px 12px",
              borderRadius: 4,
              cursor: "pointer",
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
