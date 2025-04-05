// src/components/GradesCard.tsx
import React, { useEffect, useState } from "react";

interface StockGrade {
  symbol: string;
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
  consensus: string;
}

interface GradesCardProps {
  symbol: string;
}

const GradesCard: React.FC<GradesCardProps> = ({ symbol }) => {
  const [grades, setGrades] = useState<StockGrade | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchGrades = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://proxy-server-532651853525.us-west2.run.app/stockgrades/${symbol}`
        );
        if (!res.ok) {
          throw new Error(`Server responded with ${res.status}`);
        }
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setGrades(data[0]);
          setError(""); // Clear any previous error if data exists
        } else {
          setGrades(null);
          setError("No grades data found.");
        }
      } catch (err) {
        console.error(err);
        setGrades(null);
        setError("Failed to fetch grades data.");
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [symbol]);

  return (
    <div
      style={{
        backgroundColor: "#1E2124",
        borderRadius: "8px",
        paddingTop: "10px",
        paddingLeft: "20px",
        paddingRight: "20px",
        paddingBottom: "30px",
        width: "100%",
        maxWidth: "350px",
        color: "white",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
        marginTop: "35px",
      }}
    >
      <h2 style={{ marginBottom: "25px" }}>Analyst Ratings</h2>

      {loading ? (
        <p style={{ textAlign: "center", marginTop: "20px" }}>
          Loading grades...
        </p>
      ) : error || !grades ? (
        <p style={{ textAlign: "center", marginTop: "20px" }}>
          No Grades available for this security
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {(() => {
            const { strongBuy, buy, hold, sell, strongSell } = grades;
            const categories = [
              { label: "Strong Buy", value: strongBuy },
              { label: "Buy", value: buy },
              { label: "Hold", value: hold },
              { label: "Sell", value: sell },
              { label: "Strong Sell", value: strongSell },
            ];
            const maxValue = Math.max(strongBuy, buy, hold, sell, strongSell);

            return categories.map((cat, i) => {
              const barWidth = maxValue === 0 ? 0 : (cat.value / maxValue) * 100;
              return (
                <div
                  key={cat.label}
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  {/* Label */}
                  <div style={{ width: "80px", fontSize: "14px" }}>
                    {cat.label}
                  </div>

                  {/* Bar container with rounded corners */}
                  <div
                    style={{
                      position: "relative",
                      flex: 1,
                      height: "20px",
                      backgroundColor:
                        hoverIndex === i ? "#2a2e33" : "#2f3337",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                      borderRadius: "8px",
                    }}
                    onMouseEnter={() => setHoverIndex(i)}
                    onMouseLeave={() => setHoverIndex(null)}
                  >
                    {/* Filled portion of bar with rounded corners */}
                    <div
                      style={{
                        height: "100%",
                        width: `${barWidth}%`,
                        backgroundColor:
                          hoverIndex === i
                            ? "#99cc55"
                            : "rgba(204, 247, 89, 1)",
                        transition: "width 0.3s, background-color 0.2s",
                        borderRadius:
                          barWidth === 100 ? "8px" : "8px 0 0 8px",
                      }}
                    />
                    {/* Tooltip with value on hover */}
                    {hoverIndex === i && (
                      <div
                        style={{
                          position: "absolute",
                          top: "-25px",
                          left: `${barWidth}%`,
                          transform: "translateX(-50%)",
                          backgroundColor: "#2a2e33",
                          padding: "4px 8px",
                          borderRadius: "8px",
                          fontSize: "17px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {cat.value}
                      </div>
                    )}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}
    </div>
  );
};

export default GradesCard;
