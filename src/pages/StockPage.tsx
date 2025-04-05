import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import PriceDisplay from "../components/PriceDisplay"; // Import the new component

function StockPage() {
  const location = useLocation();
  const stock = location.state?.stock?.[0];
  
  const [price, setPrice] = useState(stock?.price || 0);
  const [isChartHovering, setIsChartHovering] = useState(false);
  const [hoverPrice, setHoverPrice] = useState(null);
  
  // // This would be used when you add a chart component
  // const handleChartHover = (point) => {
  //   if (point) {
  //     setIsChartHovering(true);
  //     setHoverPrice(point.price);
  //   } else {
  //     setIsChartHovering(false);
  //     setHoverPrice(null);
  //   }
  // };

  if (!stock) return <p style={{ color: "white", padding: "2rem" }}>No stock data found.</p>;

  return (
    <div style={{ background: "#0d0d0d", minHeight: "100vh", padding: "2rem", color: "white" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.1rem" }}>{stock.name}</h1>
      <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem", color: "#00ff99" }}>{stock.symbol}</h2>
      
      {/* Use the new PriceDisplay component */}
      <PriceDisplay 
        symbol={stock.symbol}
        initialPrice={price}
        historicalPrice={hoverPrice}
        isHovering={isChartHovering}
      />
      
      {/* Placeholder for future chart component */}
      <div style={{ marginTop: "2rem" }}>
        {/* 
        When you add your chart component, you'll use it like this:
        
        <StockChart 
          symbol={stock.symbol} 
          onHover={handleChartHover}
        />
        */}
      </div>
    </div>
  );
}

export default StockPage;