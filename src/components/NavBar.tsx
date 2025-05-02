// src/components/NavBar.tsx
import { useState, useEffect, useRef } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import Search from "./Search"
function NavBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  // const handleSearch = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!query.trim()) return;

  //   const url = `${import.meta.env.VITE_PROXY_API_BASE_URL}/realtime-prices/${query}`;
  //   try {
  //     const res = await fetch(url);
  //     const data = await res.json();
  //     navigate(`/stock?ticker=${query}`, { state: { stock: data } });
  //   } catch (err) {
  //     console.error("Search failed", err);
  //   }
  // };

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Listen for scroll events to update navbar opacity
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        borderBottom: "1px solid #333",
        background: scrolled ? "rgba(18,18,18,0.9)" : "#121212",
        color: "white",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: "background 0.3s ease, opacity 0.3s ease",
      }}
    >
      <h2 style={{ color: "#00ff99", margin: 0 }}>
        <a href="/" style={{ color: "inherit", textDecoration: "none" }}>
          Tradient
        </a>
      </h2>

      {/* <form
        onSubmit={handleSearch}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          margin: "0 1rem",
        }}
      >
        <FiSearch
          style={{
            position: "absolute",
            left: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#888",
            pointerEvents: "none",
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
      </form> */}
      <Search query={query} setQuery={setQuery} navigate={navigate} />

      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          position: "relative",
        }}
      >
        {/* Dropdown Account */}
        <div ref={dropdownRef} style={{ position: "relative" }}>
          <div
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              padding: "0.5rem 1.2rem",
              borderRadius: "4px",
              backgroundColor: showDropdown ? "#1e1e1e" : "transparent",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "background-color 0.2s ease",
            }}
          >
            Account
          </div>

          {showDropdown && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                backgroundColor: "#1e1e1e",
                border: "1px solid #333",
                borderRadius: "6px",
                marginTop: "0.2rem",
                zIndex: 999,
                minWidth: "160px",
              }}
            >
              <Link
                to="/profile"
                onClick={() => setShowDropdown(false)}
                style={{
                  display: "block",
                  padding: "0.75rem 1rem",
                  color: "white",
                  textDecoration: "none",
                  borderBottom: "1px solid #333",
                }}
              >
                User Profile
              </Link>
              <Link
                to="/trading-profile"
                onClick={() => setShowDropdown(false)}
                style={{
                  display: "block",
                  padding: "0.75rem 1rem",
                  color: "white",
                  textDecoration: "none",
                }}
              >
                Trading Profile
              </Link>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          style={{
            background: "transparent",
            color: "white",
            border: "1px solid #00ff99",
            padding: "0.5rem 1.2rem",
            borderRadius: "999px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Log Out
        </button>
      </div>
    </nav>
  );
}

export default NavBar;
