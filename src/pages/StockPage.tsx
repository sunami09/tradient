import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function StockPage() {
  const location = useLocation();
  const stock = location.state?.stock?.[0];

  const [price, setPrice] = useState(stock?.price || 0); // fallback to 0 initially

  useEffect(() => {
    if (!stock?.symbol) return;
  
    const fetchPrice = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_PROXY_API_BASE_URL}/realtime-prices/${stock.symbol}`);
        const data = await res.json();
        console.log("Fetched price data:", data);
  
        // If the endpoint returns an array like [ { price: 123.45 } ]
        if (Array.isArray(data) && data.length > 0 && data[0].price !== undefined) {
          setPrice(data[0].price);
        }
      } catch (error) {
        console.error("Failed to fetch price", error);
      }
    };
  
    fetchPrice();
    const interval = setInterval(fetchPrice, 3000);
    return () => clearInterval(interval);
  }, [stock?.symbol]);
  
  

  if (!stock) return <p style={{ color: "white", padding: "2rem" }}>No stock data found.</p>;

  return (
    <div style={{ background: "#0d0d0d", minHeight: "100vh", padding: "1rem", color: "white" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.1rem" }}>{stock.name}</h1>
      <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem", color: "#00ff99" }}>{stock.symbol}</h2>
      <h3 style={{ fontSize: "2rem" }}>${price.toFixed(2)}</h3>
    </div>
  );
}

export default StockPage;
