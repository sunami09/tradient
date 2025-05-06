// src/components/GeneralNews.tsx
import React, { useEffect, useState } from "react";

interface NewsItem {
  publishedDate: string;
  publisher: string;
  title: string;
  image: string;
  site: string;
  text: string;
  url: string;
}

const GeneralNews: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        // For now, using AAPL as placeholder as mentioned
        const res = await fetch(
          `${import.meta.env.VITE_PROXY_API_BASE_URL}/companyNews/generalNews`
        );
        if (!res.ok) {
          throw new Error(`Failed to fetch news: ${res.status}`);
        }
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setNews(data);
        } else {
          setError("No news found.");
        }
      } catch (err) {
        setError("Failed to fetch news data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Helper to truncate text to a fixed number of characters
  const truncateText = (text: string, limit: number): string => {
    if (text.length <= limit) return text;
    return text.substring(0, limit) + "...";
  };

  if (loading) {
    return <div style={{ color: "white" }}>Loading news...</div>;
  }

  if (error) {
    return <div style={{ color: "white" }}>{error}</div>;
  }

  if (news.length === 0) {
    return null; // No news to display
  }

  // Slice news based on the visible count
  const displayedNews = news.slice(0, visibleCount);

  return (
    <div style={{ color: "white", marginTop: "1rem", paddingTop: "1rem" }}>
      <h2 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>Latest News</h2>
      
      {/* Horizontal line after heading */}
      <hr
        style={{
          marginBottom: "1.5rem",
          borderColor: "rgba(255,255,255,0.2)",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.8rem",
          fontSize: "0.95rem",
        }}
      >
        {displayedNews.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              gap: "1.4rem",
              padding: "1rem",
              borderRadius: "6px",
              transition: "background-color 0.2s",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLDivElement).style.backgroundColor = "#333")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLDivElement).style.backgroundColor = "transparent")
            }
          >
            {item.image && (
              <img
                src={item.image}
                alt={item.title}
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  borderRadius: "6px",
                }}
              />
            )}
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0.5rem 0", color: "#999", fontSize: "0.8rem" }}>
                {item.publisher} •{" "}
                {new Date(item.publishedDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  textDecoration: "none",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  display: "inline-block",
                  margin: "0.2rem 0",
                }}
              >
                {item.title}
              </a>
              <p style={{ margin: "0.7rem 0 0" }}>
                {truncateText(item.text, 200)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {visibleCount < news.length && (
        <button
          onClick={() => setVisibleCount(prev => prev + 5)}
          style={{
            marginTop: "2rem",
            marginBottom: "1rem",
            backgroundColor: "transparent",
            border: "1px solid rgba(204, 247, 89, 1)",
            color: "rgba(204, 247, 89, 1)",
            padding: "0.5rem 1.2rem",
            marginLeft: "50%", 
            transform: "translateX(-50%)",
            borderRadius: "999px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Show More
        </button>
      )}
    </div>
  );
};

export default GeneralNews;