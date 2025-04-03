import { useLocation } from "react-router-dom";

function StockPage() {
  const location = useLocation();
  const stock = location.state?.stock?.[0];

  if (!stock) return <p style={{ color: "white", padding: "2rem" }}>No stock data found.</p>;

  return (
    <div style={{ background: "#0d0d0d", minHeight: "100vh", padding: "1rem", color: "white" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.1rem" }}>{stock.name}</h1>
      <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem", color: "#00ff99" }}>{stock.symbol}</h2>
      <h3 style={{ fontSize: "2rem" }}>${stock.price.toFixed(2)}</h3>
    </div>
  );
}

export default StockPage;
