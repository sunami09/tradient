// src/components/KeyMetrics.tsx
import React from "react";

interface StockData {
  symbol: string;
  name: string;
  price: number;
  changePercentage: number;
  change: number;
  volume: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  exchange: string;
  open: number;
  previousClose: number;
  timestamp: number;
}

interface KeyMetricsProps {
  stock: StockData;
}

const KeyMetrics: React.FC<KeyMetricsProps> = ({ stock }) => {
  // Helper to format large numbers (e.g., market cap, volume)
  const formatNumber = (value: number) => {
    if (value >= 1e12) return (value / 1e12).toFixed(2) + "T";
    if (value >= 1e9) return (value / 1e9).toFixed(2) + "B";
    if (value >= 1e6) return (value / 1e6).toFixed(2) + "M";
    return value.toLocaleString();
  };

  return (
    <div style={{ color: "white", marginTop: "4rem" }}>
      {/* Heading */}
      <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Key Metrics</h2>
      
      {/* Horizontal line after heading */}
      <hr
        style={{
          marginBottom: "1.5rem",
          borderColor: "rgba(255,255,255,0.2)",
        }}
      />

      {/* 4-column grid of metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "2rem",
          fontSize: "1rem",
          lineHeight: "1.8",
        }}
      >
        {/* 1 */}
        <div>
          <p style={{ margin: 0, fontWeight: "bold" }}>High Today</p>
          <p style={{ margin: 0 }}>${stock.dayHigh.toFixed(2) || "---"}</p>
        </div>
        {/* 2 */}
        <div>
          <p style={{ margin: 0, fontWeight: "bold" }}>Low Today</p>
          <p style={{ margin: 0 }}>${stock.dayLow.toFixed(2) || "---"}</p>
        </div>
        {/* 3 */}
        <div>
          <p style={{ margin: 0, fontWeight: "bold" }}>52-Week High</p>
          <p style={{ margin: 0 }}>${stock.yearHigh.toFixed(2) || "---"}</p>
        </div>
        {/* 4 */}
        <div>
          <p style={{ margin: 0, fontWeight: "bold" }}>52-Week Low</p>
          <p style={{ margin: 0 }}>${stock.yearLow.toFixed(2) || "---"}</p>
        </div>

        {/* 5 */}
        <div>
          <p style={{ margin: 0, fontWeight: "bold" }}>Open Price</p>
          <p style={{ margin: 0 }}>${stock.open.toFixed(2) || "---"}</p>
        </div>
        {/* 6 */}
        <div>
          <p style={{ margin: 0, fontWeight: "bold" }}>Previous Close</p>
          <p style={{ margin: 0 }}>${stock.previousClose.toFixed(2) || "---"}</p>
        </div>
        {/* 7 */}
        <div>
          <p style={{ margin: 0, fontWeight: "bold" }}>Volume</p>
          <p style={{ margin: 0 }}>{formatNumber(stock.volume) || "---"}</p>
        </div>
        {/* 8 */}
        <div>
          <p style={{ margin: 0, fontWeight: "bold" }}>Market Cap</p>
          <p style={{ margin: 0 }}>{formatNumber(stock.marketCap) || "---"}</p>
        </div>

        {/* 9 */}
        <div>
          <p style={{ margin: 0, fontWeight: "bold" }}>50-Day Avg</p>
          <p style={{ margin: 0 }}>${stock.priceAvg50.toFixed(2) || "---"}</p>
        </div>
        {/* 10 */}
        <div>
          <p style={{ margin: 0, fontWeight: "bold" }}>200-Day Avg</p>
          <p style={{ margin: 0 }}>${stock.priceAvg200.toFixed(2) || "---"}</p>
        </div>
      </div>
    </div>
  );
};

export default KeyMetrics;
