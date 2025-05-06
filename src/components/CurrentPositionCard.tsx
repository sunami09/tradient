import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase"; // Adjust import path as needed
import { getDoc, doc } from "firebase/firestore";

interface CurrentPositionCardProps {
  symbol: string;
}

interface Position {
  symbol: string;
  qty: number;
  market_value: number;
  avg_entry_price: number;
  unrealized_pl: number;
  unrealized_plpc: number;
  current_price: number;
}

const CurrentPositionCard: React.FC<CurrentPositionCardProps> = ({ symbol }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [position, setPosition] = useState<Position | null>(null);
  const [alpacaKey, setAlpacaKey] = useState<string>("");
  const [alpacaSecret, setAlpacaSecret] = useState<string>("");

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
        const url = `${import.meta.env.VITE_PROXY_API_BASE_URL}/positions?encryptedKey=${alpacaKey}&encryptedSecret=${alpacaSecret}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log(`Looking for symbol: ${symbol}`);
        console.log("Available positions:", data.map((pos: Position) => pos.symbol));
        
        // Find the specific position for this stock symbol
        // Improve matching by trimming and ensuring strict uppercase comparison
        const currentPosition = data.find((pos: Position) => 
          pos.symbol.trim().toUpperCase() === symbol.trim().toUpperCase()
        );
        
        if (currentPosition) {
          console.log(`Found position for ${symbol}:`, currentPosition);
          setPosition(currentPosition);
        } else {
          console.log(`No position found for ${symbol}`);
          setPosition(null);
        }
      } catch (err) {
        console.error("Error fetching positions:", err);
        setError("Failed to fetch position data");
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, [alpacaKey, alpacaSecret, symbol]);

  // If no position, don't show anything
  if (!position && !loading) {
    return null;
  }

  if (loading) {
    return (
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          borderRadius: "8px",
          padding: "1rem",
          marginTop: "1rem",
          marginBottom: "1rem",
          color: "white"
        }}
      >
        Loading position data...
      </div>
    );
  }

  if (error) {
    return null; // Don't show errors, just don't display anything
  }

  // Calculate profit/loss color
  const profitLossColor = position && position.unrealized_pl >= 0 
    ? "rgba(204, 247, 89, 1)" 
    : "red";

  return position ? (
    <div style={{ color: "white", marginTop: "2rem", marginBottom: "2rem" }}>
      {/* Heading */}
      <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Your Position</h2>
      
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr", 
        gap: "1.5rem",
        maxWidth: "100%"
      }}>
        {/* Left Card */}
        <div style={{ 
          background: "rgba(20, 20, 20, 0.6)",
          borderRadius: "12px",
          padding: "1.5rem"
        }}>
          <div style={{ marginBottom: "0.5rem", opacity: 0.7, fontSize: "0.9rem" }}>
            Your market value
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
            ${parseFloat(position.market_value.toString()).toFixed(2)}
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.8rem" }}>
            <div style={{ opacity: 0.7, fontSize: "0.9rem" }}>Today's return</div>
            <div style={{ 
              color: position.unrealized_pl >= 0 ? "rgba(204, 247, 89, 1)" : "red",
              fontSize: "0.9rem"
            }}>
              ${parseFloat(position.unrealized_pl.toString()).toFixed(2)} ({(parseFloat(position.unrealized_plpc.toString()) * 100).toFixed(2)}%)
            </div>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ opacity: 0.7, fontSize: "0.9rem" }}>Total return</div>
            <div style={{ 
              color: position.unrealized_pl >= 0 ? "rgba(204, 247, 89, 1)" : "red",
              fontSize: "0.9rem"  
            }}>
              ${parseFloat(position.unrealized_pl.toString()).toFixed(2)} ({(parseFloat(position.unrealized_plpc.toString()) * 100).toFixed(2)}%)
            </div>
          </div>
        </div>
        
        {/* Right Card */}
        <div style={{ 
          background: "rgba(20, 20, 20, 0.6)",
          borderRadius: "12px",
          padding: "1.5rem"
        }}>
          <div style={{ marginBottom: "0.5rem", opacity: 0.7, fontSize: "0.9rem" }}>
            Your average cost
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
            ${parseFloat(position.avg_entry_price.toString()).toFixed(2)}
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.8rem" }}>
            <div style={{ opacity: 0.7, fontSize: "0.9rem" }}>Shares</div>
            <div style={{ fontSize: "0.9rem" }}>{position.qty}</div>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ opacity: 0.7, fontSize: "0.9rem" }}>Current Price</div>
            <div style={{ fontSize: "0.9rem" }}>${parseFloat(position.current_price.toString()).toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default CurrentPositionCard;