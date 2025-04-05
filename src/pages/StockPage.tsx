import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import PriceDisplay from "../components/PriceDisplay";
import StockChart from "../components/StockChart";
import TradeCard from "../components/TradeCard";

interface ChartHoverPoint {
  price: number;
  date: string;
}

function StockPage() {
  const location = useLocation();
  const stock = location.state?.stock?.[0];
  
  const [price, setPrice] = useState(stock?.price || 0);
  const [isChartHovering, setIsChartHovering] = useState(false);
  const [hoverPrice, setHoverPrice] = useState<number | null>(null);
  
  // Handle chart hover events
  const handleChartHover = (point: ChartHoverPoint | null) => {
    if (point) {
      setIsChartHovering(true);
      setHoverPrice(point.price);
    } else {
      setIsChartHovering(false);
      setHoverPrice(null);
    }
  };

  if (!stock) return <p style={{ color: "white", padding: "2rem" }}>No stock data found.</p>;

  return (
    <div style={{ background: "#0d0d0d", minHeight: "100vh", padding: "2rem", paddingLeft:"4rem", color: "white" }}>
      <div className="content" style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 350px",
        gap: "2rem",
        maxWidth: "90vw",
        // margin: "0 auto"
      }}>
        {/* Left side - Chart and Info */}
        <div>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.1rem" }}>{stock.name}</h1>
          <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem", color: "#00ff99" }}>{stock.symbol}</h2>
          
          {/* Price display that updates on chart hover */}
          <PriceDisplay 
            symbol={stock.symbol}
            initialPrice={price}
            historicalPrice={hoverPrice}
            isHovering={isChartHovering}
          />
          
          {/* Chart component */}
          <div style={{ marginTop: "2rem", width: "100%" }}>
            <StockChart 
              symbol={stock.symbol} 
              onHover={handleChartHover}
            />
          </div>
        </div>
        
        {/* Right side - Trade Card */}
        <div style={{ alignSelf: "start", position: "sticky", top: "3.5rem", paddingTop: "2.9rem"}}>
          <TradeCard symbol={stock.symbol} />
        </div>
      </div>
    </div>
  );
}

export default StockPage;