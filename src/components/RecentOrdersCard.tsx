import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase"; // Adjust import path as needed
import { getDoc, doc } from "firebase/firestore";

const RecentOrdersCard: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
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

  // Fetch recent orders when credentials are available
  useEffect(() => {
    const fetchOrders = async () => {
      if (!alpacaKey || !alpacaSecret) return;
      
      setLoading(true);
      try {
        // Get the 10 most recent orders
        const url = `${import.meta.env.VITE_PROXY_API_BASE_URL}/orders?encryptedKey=${alpacaKey}&encryptedSecret=${alpacaSecret}&limit=10`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to fetch recent orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [alpacaKey, alpacaSecret]);

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          borderRadius: "8px",
          padding: "1.5rem",
          marginBottom: "1rem",
          marginTop: "10vh",
          color: "white",
          fontSize: "1.1rem" // Increased from default
        }}
      >
        Loading recent orders...
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
          marginTop: "10vh",
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
        padding: "1.5rem",
        marginBottom: "1rem",
        marginTop: "5vh",
        color: "white",
        fontSize: "1.1rem" // Base font size increased for the entire component
      }}
    >
      <h2 style={{ fontSize: "1.7rem", marginBottom: "1rem" }}>Recent Orders</h2>
      
      {orders.length === 0 ? (
        <p>No recent orders found.</p>
      ) : (
        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
          {orders.map((order, index) => (
            <div
              key={order.id}
              style={{
                padding: "0.8rem 0",
                borderBottom: index < orders.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <div>
                  <span
                    style={{
                      fontWeight: "bold",
                      color: order.side.toLowerCase() === "buy" ? "rgba(204, 247, 89, 1)" : "red",
                      marginRight: "0.6rem",
                      textTransform: "uppercase",
                      fontSize: "1.15rem" // Increased from original
                    }}
                  >
                    {order.side}
                  </span>
                  <span style={{ fontWeight: "bold", fontSize: "1.15rem" }}>{order.symbol}</span>
                  <span style={{ marginLeft: "0.6rem", fontSize: "1.05rem" }}>{order.qty} shares</span>
                </div>
                <div style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.7)" }}>
                  {formatDate(order.created_at)}
                </div>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontSize: "1.05rem" }}>
                  <span style={{ textTransform: "capitalize" }}>{order.type.toLowerCase()}</span>
                  {order.filled_avg_price && (
                    <span> @ ${parseFloat(order.filled_avg_price).toFixed(2)}</span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: "1rem",
                    backgroundColor: getStatusColor(order.status),
                    padding: "0.3rem 0.6rem", // Slightly increased padding
                    borderRadius: "4px",
                    textTransform: "capitalize",
                  }}
                >
                  {order.status.toLowerCase()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper function to get background color based on order status
function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "filled":
      return "rgba(79, 171, 89, 0.4)"; // Green
    case "partially_filled":
      return "rgba(240, 173, 78, 0.4)"; // Orange
    case "canceled":
      return "rgba(217, 83, 79, 0.3)"; // Red
    case "open":
      return "rgba(91, 192, 222, 0.4)"; // Blue
    case "new":
      return "rgba(91, 192, 222, 0.4)"; // Blue
    default:
      return "rgba(153, 153, 153, 0.4)"; // Gray
  }
}

export default RecentOrdersCard;