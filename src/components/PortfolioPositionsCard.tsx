import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase"; // Adjust import path as needed
import { getDoc, doc } from "firebase/firestore";

const PortfolioPositionsCard: React.FC = () => {
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [alpacaKey, setAlpacaKey] = useState<string>("");
  const [alpacaSecret, setAlpacaSecret] = useState<string>("");
  const [totalValue, setTotalValue] = useState<number>(0);

  // Load Alpaca credentials
  useEffect(() => {
    const fetchCredentials = async () => {
      if (!auth.currentUser) return;
      try {
        const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userSnap.exists()) {
          const data = userSnap.data();
          setAlpacaKey(data.alpacaKey || data.alpacakey || "");
          setAlpacaSecret(data.alpacaSecret || data.alpacasecret || "");
        }
      } catch (err) {
        console.error("Error fetching Alpaca credentials:", err);
        setError("Failed to load credentials");
      }
    };

    fetchCredentials();
  }, []);

  // Fetch positions when credentials are available
  useEffect(() => {
    const fetchPositions = async () => {
      if (!alpacaKey || !alpacaSecret) return;
      
      setLoading(true);
      try {
        const url = `${import.meta.env.VITE_PROXY_API_BASE_URL}/positions?apikey=${alpacaKey}&secret=${alpacaSecret}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        setPositions(data);
        
        // Calculate total portfolio value
        const total = data.reduce((sum: number, position: any) => 
          sum + parseFloat(position.market_value), 0);
        setTotalValue(total);
        
      } catch (err) {
        console.error("Error fetching positions:", err);
        setError("Failed to fetch portfolio positions");
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, [alpacaKey, alpacaSecret]);

  // Group positions by asset class for allocation display
  const assetAllocation = positions.reduce((acc: {[key: string]: number}, position) => {
    const assetClass = position.asset_class || "Unknown";
    acc[assetClass] = (acc[assetClass] || 0) + parseFloat(position.market_value);
    return acc;
  }, {});

  if (loading) {
    return (
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          borderRadius: "8px",
          padding: "1.5rem",
          marginBottom: "1rem",
          color: "white",
          fontSize: "1.1rem" // Increased from default
        }}
      >
        Loading portfolio positions...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          borderRadius: "8px",
          padding: "1.5rem",
          marginBottom: "1rem",
          color: "white",
          fontSize: "1.1rem" // Increased from default
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.05)",
        borderRadius: "8px",
        marginTop: "3vh",
        padding: "1.5rem",
        marginBottom: "1rem",
        color: "white",
        fontSize: "1.1rem" // Base font size increased for the entire component
      }}
    >
      <h2 style={{ fontSize: "1.7rem", marginBottom: "1.9rem" }}>Portfolio Positions</h2>
      
      {positions.length === 0 ? (
        <p>No positions found in your portfolio.</p>
      ) : (
        <>
          <div style={{ marginBottom: "1.2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem" }}>
              <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>Total Value:</span>
              <span style={{ fontSize: "1.2rem" }}>${totalValue.toFixed(2)}</span>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem" }}>
              <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>Positions:</span>
              <span style={{ fontSize: "1.2rem" }}>{positions.length}</span>
            </div>
          </div>
          
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              {positions
                .sort((a, b) => parseFloat(b.market_value) - parseFloat(a.market_value))
                .slice(0, 5)
                .map((position, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "0.7rem 0",
                      borderBottom: index < 4 ? "1px solid rgba(255,255,255,0.1)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={{ fontWeight: "bold", marginRight: "0.5rem", fontSize: "1.15rem" }}>{position.symbol}</span>
                      <span style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.7)" }}>
                        {position.qty} shares
                      </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "1.15rem" }}>${parseFloat(position.market_value).toFixed(2)}</div>
                      <div
                        style={{
                          fontSize: "0.95rem",
                          color: parseFloat(position.unrealized_pl) >= 0 ? "rgba(204, 247, 89, 1)" : "red",
                        }}
                      >
                        {parseFloat(position.unrealized_pl) >= 0 ? "+" : ""}
                        ${parseFloat(position.unrealized_pl).toFixed(2)} (
                        {(parseFloat(position.unrealized_plpc) * 100).toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PortfolioPositionsCard;