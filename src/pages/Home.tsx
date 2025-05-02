// pages/HomePage.tsx
import React, { useState } from "react";
import PortfolioChart from "../components/PortfolioChart";
import PortfolioValueDisplay from "../components/PortfolioValueDisplay";
import PortfolioSummaryCard from "../components/PortfolioSummaryCard";
import AssetAllocationCard from "../components/AssetAllocationCard";
import ExtraInfoCard from "../components/ExtraInfoCard";

function HomePage() {
  const [isChartHovering, setIsChartHovering] = useState(false);
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const handleChartHover = (point: { price: number; date: string } | null) => {
    if (point) {
      setIsChartHovering(true);
      setHoverValue(point.price);
    } else {
      setIsChartHovering(false);
      setHoverValue(null);
    }
  };

  return (
    <div
      style={{
        background: "#0d0d0d",
        minHeight: "100vh",
        padding: "3rem 4rem",        // symmetrical padding
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
          margin: "0 auto",          // center the grid
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

          {/* one card below */}
          <div style={{ marginTop: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
              Your Assets
            </h2>
            <ExtraInfoCard />
          </div>
        </div>

        {/* Right side */}
        <div>
          <PortfolioSummaryCard />
          <AssetAllocationCard />
        </div>
      </div>
    </div>
  );
}

export default HomePage;