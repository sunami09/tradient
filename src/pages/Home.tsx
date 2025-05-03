// pages/HomePage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { getDoc, doc } from "firebase/firestore";
import { DotLottieReact } from "@lottiefiles/dotlottie-react"; // Add this import
import PortfolioChart from "../components/PortfolioChart";
import PortfolioValueDisplay from "../components/PortfolioValueDisplay";
import PortfolioPositionsCard from "../components/PortfolioPositionsCard";
import RecentOrdersCard from "../components/RecentOrdersCard";
import GeneralNews from "../components/GeneralNews";

function HomePage() {
  const navigate = useNavigate();
  const [isChartHovering, setIsChartHovering] = useState(false);
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [hasCredentials, setHasCredentials] = useState<boolean | null>(null);
  const [validCredentials, setValidCredentials] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user has Alpaca credentials in Firebase
  useEffect(() => {
    const checkCredentials = async () => {
      if (!auth.currentUser) return;
      
      try {
        const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userSnap.exists()) {
          const data = userSnap.data();
          const hasKeys = Boolean(
            (data.alpacaKey || data.alpacakey) && 
            (data.alpacaSecret || data.alpacasecret)
          );
          
          setHasCredentials(hasKeys);
          
          // If they have keys, validate them
          if (hasKeys) {
            validateAlpacaCredentials(
              data.alpacaKey || data.alpacakey,
              data.alpacaSecret || data.alpacasecret
            );
          } else {
            setLoading(false);
          }
        } else {
          setHasCredentials(false);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error checking credentials:", err);
        setHasCredentials(false);
        setLoading(false);
      }
    };
    
    checkCredentials();
  }, []);
  
  // Validate Alpaca credentials by calling the account endpoint
  const validateAlpacaCredentials = async (apiKey: string, apiSecret: string) => {
    try {
      const url = `${import.meta.env.VITE_PROXY_API_BASE_URL}/account?encryptedKey=${apiKey}&encryptedSecret=${apiSecret}`;
      const response = await fetch(url);
      
      setValidCredentials(response.ok);
      setLoading(false);
    } catch (err) {
      console.error("Error validating credentials:", err);
      setValidCredentials(false);
      setLoading(false);
    }
  };

  const handleChartHover = (point: { price: number; date: string } | null) => {
    if (point) {
      setIsChartHovering(true);
      setHoverValue(point.price);
    } else {
      setIsChartHovering(false);
      setHoverValue(null);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div style={{ 
        background: "#0d0d0d", 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        color: "white",
        fontSize: "1.2rem"
      }}>
        Loading your investment data...
      </div>
    );
  }

  // No credentials scenario - Show full-width news with trading profile button and Lottie animation
  if (!hasCredentials) {
    return (
      <div style={{ background: "#0d0d0d", minHeight: "100vh", padding: "3rem 4rem", color: "white" }}>
        <div style={{ maxWidth: "90vw", margin: "0 auto" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "2rem" }}>Welcome to Tradient</h1>
          
          <div style={{ 
            background: "rgba(255,255,255,0.05)", 
            borderRadius: "8px", 
            padding: "2rem", 
            marginBottom: "2rem",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}>
            <p style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>
              Connect your Alpaca trading account to visualize your portfolio and track your investments.
            </p>
            
            {/* Lottie Animation Container - Now positioned between text and button */}
            <div 
              className="animation-container"
              style={{
                width: "300px",
                height: "300px",
                marginBottom: "1rem",
                position: "relative",
              }}
            >
              <DotLottieReact
                src="https://lottie.host/0a271a91-05c2-43f1-80b4-b587a9ed4dea/KOL7WEgkA5.lottie"
                autoplay={true}
                loop={true}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
            
            {/* Button now positioned after the animation */}
            <button 
              onClick={() => navigate('/trading-profile')}
              style={{
                background: "rgba(204, 247, 89, 1)",
                color: "#121212",
                border: "none",
                padding: "0.8rem 2rem",
                borderRadius: "8px",
                fontSize: "1.1rem",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0px 4px 10px rgba(204, 247, 89, 0.3)",
                zIndex: "1",
              }}
            >
              Create Your Trading Profile
            </button>
          </div>
          
          <GeneralNews />
        </div>

        {/* Add styles for animation effects */}
        <style>
          {`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
            
            /* Apply the float animation to the animation container */
            .animation-container {
              animation: float 3s ease-in-out infinite;
            }
          `}
        </style>
      </div>
    );
  }

  // Has credentials but they're invalid - Show error message
  if (hasCredentials && validCredentials === false) {
    return (
      <div style={{ background: "#0d0d0d", minHeight: "100vh", padding: "3rem 4rem", color: "white" }}>
        <div style={{ maxWidth: "90vw", margin: "0 auto" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "2rem" }}>Investing Portfolio</h1>
          
          <div style={{ 
            background: "rgba(255,255,255,0.05)", 
            borderRadius: "8px", 
            padding: "1rem", 
            marginBottom: "2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            position: "relative",
            overflow: "hidden", // Prevent animation from overflowing
          }}>
            {/* Error Lottie Animation Container */}
            <div 
              className="error-animation-container"
              style={{
                width: "300px",
                height: "300px",
                position: "relative",
              }}
            >
              <DotLottieReact
                src="https://lottie.host/19541087-8bf6-4232-b7c4-c7d36e8203b8/XRbFjWZHMT.lottie"
                autoplay={true}
                loop={true}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
            
            <h3 style={{ color: "red", marginBottom: "1rem" }}>API Verification Error</h3>
            <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem", maxWidth: "80%" }}>
              We couldn't connect to your Alpaca trading account. Your API credentials might be invalid or expired.
            </p>
            
            <button 
              onClick={() => navigate('/trading-profile')}
              style={{
                background: "transparent",
                color: "rgba(204, 247, 89, 1)",
                border: "1px solid rgba(204, 247, 89, 1)",
                padding: "0.7rem 1.5rem",
                borderRadius: "8px",
                fontSize: "1.1rem",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              Update Trading Profile
            </button>
          </div>
          
          <GeneralNews />
        </div>

        <style>
          {`
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.05); opacity: 0.9; }
            }
            
            /* Apply the pulse animation to the error animation container */
            .error-animation-container {
              animation: pulse 2s ease-in-out infinite;
            }
          `}
        </style>
      </div>
    );
  }

  // Default scenario - Has valid credentials
  return (
    <div
      style={{
        background: "#0d0d0d",
        minHeight: "100vh",
        padding: "3rem 4rem",
        color: "white",
      }}
    >
      <div
        className="content"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 500px",
          gap: "2rem",
          maxWidth: "90vw",
          margin: "0 auto",
        }}
      >
        {/* Left side */}
        <div>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.1rem" }}>
            Investing Portfolio
          </h1>

          <PortfolioValueDisplay
            initialValue={0.0}
            historicalValue={hoverValue}
            isHovering={isChartHovering}
          />

          <div style={{ marginTop: "2rem", width: "100%" }}>
            <PortfolioChart onHover={handleChartHover} />
          </div>

          <hr
            style={{
              margin: "1.5rem 0",
              borderColor: "rgba(255,255,255,0.2)",
            }}
          />

          {/* News section */}
          <div style={{ marginTop: "2rem" }}>
            <GeneralNews />
          </div>
        </div>

        {/* Right side */}
        <div>
          <PortfolioPositionsCard />
          <RecentOrdersCard />
        </div>
      </div>
    </div>
  );
}

export default HomePage;