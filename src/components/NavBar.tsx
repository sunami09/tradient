import { useState, useEffect, useRef } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import Search from "./Search";

function NavBar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showAccount, setShowAccount] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowAccount(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
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
        color: "#fff",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: "background 0.3s",
      }}
    >
      <h2 style={{ margin: 0 }}>
        <Link to="/" style={{ color: "#00ff99", textDecoration: "none" }}>
          Tradient
        </Link>
      </h2>

      <Search />

      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <Link
          to="/"
          style={{
            padding: "0.5rem 0.6rem",
            color: "#fff",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          Investing
        </Link>
        
        <div ref={dropdownRef} style={{ position: "relative" }}>
          <div
            onClick={() => setShowAccount((v) => !v)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: 4,
              background: showAccount ? "#1e1e1e" : "transparent",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Account
          </div>
          {showAccount && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                background: "#1e1e1e",
                border: "1px solid #333",
                borderRadius: 6,
                marginTop: 4,
                zIndex: 1001,
                minWidth: 160,
              }}
            >
              <Link
                to="/profile"
                onClick={() => setShowAccount(false)}
                style={{
                  display: "block",
                  padding: "0.75rem 1rem",
                  color: "#fff",
                  textDecoration: "none",
                  borderBottom: "1px solid #333",
                }}
              >
                User Profile
              </Link>
              <Link
                to="/trading-profile"
                onClick={() => setShowAccount(false)}
                style={{
                  display: "block",
                  padding: "0.75rem 1rem",
                  color: "#fff",
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
            color: "#fff",
            border: "1px solid #00ff99",
            padding: "0.5rem 1.2rem",
            borderRadius: 999,
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