import { useState, useEffect, useRef } from "react";

// Define the prop types for the component
interface PriceDisplayProps {
  symbol: string;
  initialPrice?: number;
  historicalPrice?: number | null;
  isHovering?: boolean;
}

// A simplified component for displaying stock prices
const PriceDisplay: React.FC<PriceDisplayProps> = ({ 
  symbol, 
  initialPrice = 0, 
  historicalPrice = null,
  isHovering = false
}) => {
  const [currentPrice, setCurrentPrice] = useState(initialPrice);
  const [priceColor, setPriceColor] = useState("white");
  const [isLoading, setIsLoading] = useState(false);
  
  // Use refs to handle race conditions
  const currentSymbolRef = useRef(symbol);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Reset state when symbol changes
  useEffect(() => {
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Update the ref with the current symbol
    currentSymbolRef.current = symbol;
    
    // Reset states for new symbol
    setCurrentPrice(initialPrice);
    setPriceColor("white");
    setIsLoading(true);
    
    // Fetch price data once when component mounts or symbol changes
    fetchPriceData();
    
    // Clean up function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [symbol, initialPrice]);

  // Set up an interval to update the price every 10 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchPriceData();
    }, 5000); // 10,000ms = 10 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [symbol]);

  // Effect to handle hover state - no realtime updates while hovering
  useEffect(() => {
    if (isHovering && historicalPrice !== null) {
      // Show the historical price when hovering
      setCurrentPrice(historicalPrice);
    } else if (!isHovering && initialPrice) {
      // Revert to the initial price when not hovering
      setCurrentPrice(initialPrice);
    }
  }, [historicalPrice, isHovering, initialPrice]);

  // Function to fetch price data
  const fetchPriceData = async () => {
    if (!currentSymbolRef.current) return;
    
    // Abort any previous request before starting a new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    try {
      const res = await fetch(
        `${import.meta.env.VITE_PROXY_API_BASE_URL}/realtime-prices/${currentSymbolRef.current}`,
        { signal: abortControllerRef.current.signal }
      );
      
      if (!res.ok) {
        throw new Error(`Failed to fetch price: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Ensure we're still on the active symbol
      if (currentSymbolRef.current !== symbol) {
        return;
      }
      
      if (Array.isArray(data) && data.length > 0 && data[0].price !== undefined) {
        const newPrice = data[0].price;
        setCurrentPrice(newPrice);
        setIsLoading(false);
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error("Failed to fetch price", error);
      }
      setIsLoading(false);
    }
  };

  // Determine which price to display based on hover state
  const displayPrice = isHovering && historicalPrice !== null 
    ? historicalPrice 
    : currentPrice;

  return (
    <div style={{ position: 'relative' }}>
      <h3 
        style={{ 
          fontSize: "2rem", 
          color: priceColor,
          transition: "color 0.3s ease"
        }}
      >
        ${displayPrice.toFixed(2)}
        {isHovering && <span style={{ fontSize: "1rem", marginLeft: "10px", opacity: 0.7 }}>
          (Historical)
        </span>}
      </h3>
      
      {isLoading && (
        <div 
          style={{ 
            position: 'absolute', 
            right: '-25px', 
            top: '50%', 
            transform: 'translateY(-50%)'
          }}
        >
          <div 
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              border: '2px solid rgba(204, 247, 89, 0.2)',
              borderTopColor: 'rgba(204, 247, 89, 1)',
              animation: 'spin 1s linear infinite'
            }}
          />
        </div>
      )}
      
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default PriceDisplay;
