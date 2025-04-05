import { useState, useEffect } from "react";

// Define the prop types for the component
interface PriceDisplayProps {
  symbol: string;
  initialPrice?: number;
  historicalPrice?: number | null;
  isHovering?: boolean;
}

// A reusable component for displaying stock prices
// Can show real-time prices or historical prices during chart hover
const PriceDisplay: React.FC<PriceDisplayProps> = ({ 
  symbol, 
  initialPrice = 0, 
  historicalPrice = null,
  isHovering = false
}) => {
  const [currentPrice, setCurrentPrice] = useState(initialPrice);
  const [priceColor, setPriceColor] = useState("white"); // Default color
  const [lastPrice, setLastPrice] = useState(initialPrice);

  // Fetch and update real-time prices
  useEffect(() => {
    if (!symbol || isHovering) return;

    const fetchPrice = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_PROXY_API_BASE_URL}/realtime-prices/${symbol}`);
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0 && data[0].price !== undefined) {
          setLastPrice(currentPrice);
          setCurrentPrice(data[0].price);
          
          // Reset color after a short delay
          setTimeout(() => setPriceColor("white"), 3000);
        }
      } catch (error) {
        console.error("Failed to fetch price", error);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 4000);
    return () => clearInterval(interval);
  }, [symbol, currentPrice, lastPrice, isHovering]);

  // Display the historical price when hovering over chart
  useEffect(() => {
    if (isHovering && historicalPrice !== null) {
      setCurrentPrice(historicalPrice);
    } else if (!isHovering && lastPrice) {
      // Restore real-time price when not hovering
      setCurrentPrice(lastPrice);
    }
  }, [historicalPrice, isHovering, lastPrice]);

  return (
    <h3 
      style={{ 
        fontSize: "2rem", 
        color: priceColor,
        transition: "color 0.3s ease"
      }}
    >
      ${currentPrice.toFixed(2)}
      {isHovering && <span style={{ fontSize: "1rem", marginLeft: "10px", opacity: 0.7 }}>
        (Historical)
      </span>}
    </h3>
  );
};

export default PriceDisplay;