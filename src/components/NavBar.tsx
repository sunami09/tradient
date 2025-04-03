// src/components/NavBar.tsx
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";

function NavBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
  
    const url = `${import.meta.env.VITE_PROXY_API_BASE_URL}/realtime-prices/${query}`;
    console.log("📡 Fetching:", url);
  
    try {
      const res = await fetch(url);
      const data = await res.json();
      console.log("🔍 Search Result:", data);
      navigate(`/stock?ticker=${query}`, { state: { stock: data } });
    } catch (err) {
      console.error("Search failed", err);
    }
  };
  

  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "1rem 2rem",
      borderBottom: "1px solid #333",
      background: "#121212",
      color: "white"
    }}>
      <h2 style={{ color: "#00ff99", margin: 0 }}>Tradient</h2>

      <form onSubmit={handleSearch} style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        margin: "0 1rem",
      }}>
        <FiSearch
            style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#888",
                pointerEvents: "none"
            }}
        />

        <input
          type="text"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value.toUpperCase())}
          style={{
            backgroundColor: "#000",
            border: "1px solid #333",
            borderRadius: "6px",
            padding: "0.4rem 0.4rem 0.4rem 2rem",
            color: "white",
            width: "20vw",
            outline: "none",
          }}
        />
      </form>

      <button
        onClick={handleLogout}
        style={{
          background: "transparent",
          color: "white",
          border: "1px solid #00ff99",
          padding: "0.5rem 1.2rem",
          borderRadius: "999px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        Log Out
      </button>
    </nav>
  );
}

export default NavBar;
