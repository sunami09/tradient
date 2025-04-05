import React, { useEffect, useState } from "react";

interface CompanyProfile {
  symbol: string;
  description: string;
  ceo: string; // Added CEO field
  industry: string;
  sector: string;
  ipoDate: string;
  website: string;
  image: string;
}

interface CompanyDetailsProps {
  symbol: string;
}

const CompanyDetails: React.FC<CompanyDetailsProps> = ({ symbol }) => {
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://proxy-server-532651853525.us-west2.run.app/companyProfile/${symbol}`
        );
        if (!res.ok) {
          throw new Error(`Server responded with ${res.status}`);
        }
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCompany(data[0]);
        } else {
          setError("No company data found.");
        }
      } catch (err) {
        setError("Failed to fetch company data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [symbol]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
          color: "white",
        }}
      >
        Loading company details...
      </div>
    );
  }

  if (error) {
    return <div style={{ color: "white" }}>{error}</div>;
  }

  if (!company) {
    return null; // or some fallback
  }

  // Extract fields with fallback to "-" if missing
  const {
    description = "-",
    ceo = "-", // Use CEO field
    industry = "-",
    sector = "-",
    ipoDate = "-",
    website,
    image,
  } = company;

  // Heading: either image hyperlinked to website or "About"
  let heading: React.ReactNode;
  if (website && image) {
    heading = (
      <a
        href={website}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: "inline-block", marginBottom: "1rem" }}
      >
        <img
          src={image}
          alt="Company Logo"
          style={{ maxHeight: "7vh", maxWidth: "100%" }}
        />
      </a>
    );
  } else {
    heading = <h2>About</h2>;
  }

  // Truncate to first 2 sentences if not expanded
  const truncatedDescription = truncateToSentences(description, 2);
  const isTruncable = truncatedDescription !== description;

  return (
    <div style={{ color: "white", marginTop: "2rem" }}>
      {heading}

      {/* Description with "Read more" toggle */}
      <p style={{ margin: "0.5rem 0 1.5rem 0" }}>
        {isExpanded ? description : truncatedDescription}{" "}
        {isTruncable && (
          <span
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              color: "rgba(204, 247, 89, 1)",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            {isExpanded ? "Read less" : "Read more"}
          </span>
        )}
      </p>

      {/* Stats side by side (2 columns) with a slightly smaller font size */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "1rem",
          lineHeight: "1.6",
          fontSize: "0.9rem",
        }}
      >
        {/* Column 1 - Now displays CEO */}
        <div>
          <p style={{ margin: "0", fontWeight: "bold" }}>CEO</p>
          <p style={{ margin: "0" }}>{ceo || "---"}</p>
        </div>
        <div>
          <p style={{ margin: "0", fontWeight: "bold" }}>Industry</p>
          <p style={{ margin: "0" }}>{industry || "---"}</p>
        </div>

        {/* Column 2 */}
        <div>
          <p style={{ margin: "0", fontWeight: "bold" }}>Sector</p>
          <p style={{ margin: "0" }}>{sector || "---"}</p>
        </div>
        <div>
          <p style={{ margin: "0", fontWeight: "bold" }}>IPO Date</p>
          <p style={{ margin: "0" }}>{ipoDate || "---"}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Utility function to truncate text to a given number of sentences.
 * Returns the original text if it has fewer than the specified sentenceCount.
 */
function truncateToSentences(text: string, sentenceCount: number): string {
  if (!text || text === "-") return "-";

  const sentences = text.split(". ").filter((s) => s.trim().length > 0);
  if (sentences.length <= sentenceCount) {
    return text;
  }
  const truncated = sentences.slice(0, sentenceCount).join(". ");
  return truncated.endsWith(".") ? truncated : truncated + ".";
}

export default CompanyDetails;
