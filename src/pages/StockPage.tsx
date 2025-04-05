// src/pages/StockPage.tsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PriceDisplay from "../components/PriceDisplay";
import StockChart from "../components/StockChart";
import TradeCard from "../components/TradeCard";

interface StockData {
  symbol: string;
  name: string;
  price: number;
  // Other stock properties...
}

function StockPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Set initial stock state from location state if available
  const initialStockData = location.state?.stock?.[0] || null;
  const [stock, setStock] = useState<StockData | null>(initialStockData);
  
  // States for chart hover interactions
  const [isChartHovering, setIsChartHovering] = useState(false);
  const [hoverPrice, setHoverPrice] = useState<number | null>(null);

  // Update stock state whenever location changes
  useEffect(() => {
    const newStockData = location.state?.stock?.[0];
    if (newStockData) {
      setStock(newStockData);
    } else if (location.search) {
      // If state is missing, extract ticker from URL and fetch data
      const params = new URLSearchParams(location.search);
      const ticker = params.get("ticker");
      if (ticker) {
        fetchStockData(ticker);
      }
    }
  }, [location]);

  // Function to fetch stock data if needed
  const fetchStockData = async (symbol: string) => {
    try {
      const url = `${import.meta.env.VITE_PROXY_API_BASE_URL}/realtime-prices/${symbol}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setStock(data[0]);
      } else {
        console.error("No stock data found");
      }
    } catch (err) {
      console.error("Failed to fetch stock data:", err);
    }
  };

  // Handle chart hover events
  const handleChartHover = (point: { price: number; date: string } | null) => {
    if (point) {
      setIsChartHovering(true);
      setHoverPrice(point.price);
    } else {
      setIsChartHovering(false);
      setHoverPrice(null);
    }
  };

  // Display a loading state if stock data isn't available yet
  if (!stock) {
    return (
      <div
        style={{
          color: "white",
          padding: "2rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2>Loading stock data...</h2>
          <div
            style={{
              width: "30px",
              height: "30px",
              margin: "20px auto",
              borderRadius: "50%",
              border: "3px solid rgba(204, 247, 89, 0.2)",
              borderTopColor: "rgba(204, 247, 89, 1)",
              animation: "spin 1s linear infinite",
            }}
          />
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#0d0d0d",
        minHeight: "100vh",
        padding: "2rem",
        paddingLeft: "4rem",
        color: "white",
      }}
    >
      <div
        className="content"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 350px",
          gap: "2rem",
          maxWidth: "90vw",
        }}
      >
        {/* Left side - Chart and Info */}
        <div>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.1rem" }}>
            {stock.name}
          </h1>
          <h2
            style={{
              fontSize: "1rem",
              marginBottom: "0.5rem",
              color: "rgba(204, 247, 89, 1)",
            }}
          >
            {stock.symbol}
          </h2>

          {/* Price Display */}
          <PriceDisplay
            symbol={stock.symbol}
            initialPrice={stock.price}
            historicalPrice={hoverPrice}
            isHovering={isChartHovering}
          />

          {/* Stock Chart */}
          <div style={{ marginTop: "2rem", width: "100%" }}>
            <StockChart symbol={stock.symbol} onHover={handleChartHover} />
          </div>
        </div>

        {/* Right side - Trade Card */}
        <div
          style={{
            alignSelf: "start",
            position: "sticky",
            top: "3.5rem",
            paddingTop: "2.9rem",
          }}
        >
          <TradeCard symbol={stock.symbol} />
        </div>
      </div>
    </div>
  );
}

export default StockPage;
