import { FiSearch } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface Company {
  symbol: string;
  companyName: string;
}

interface SearchDropdownProps {
  history: string[];
  showHistory: boolean;
  results: Company[];
  handleSearch: (e: React.MouseEvent | React.FormEvent, query: string) => void;
  setHistory: React.Dispatch<React.SetStateAction<string[]>>;
}

function SearchDropdown({
  history,
  showHistory,
  results,
  handleSearch,
  setHistory,
}: SearchDropdownProps) {
  const clearHistory = () => {
    localStorage.removeItem("searchHistory");
    setHistory([]);
  };

  const dropdownStyle: React.CSSProperties = {
    position: "absolute",
    top: "100%",
    width: "100%",
    boxSizing: "border-box",
    background: "#000",
    border: "1px solid #333",
    borderTop: "none",
    borderRadius: "0 0 6px 6px",
    maxHeight: 300,
    overflowY: "auto",
    zIndex: 1001,
  };

  if (!showHistory) {
    return (
      <div style={dropdownStyle}>
        {results.slice().reverse().map((c, i) => (
          <div
            key={c.symbol + i}
            style={{ padding: "0.5rem 1rem", cursor: "pointer", color: "#fff" }}
            onClick={(e) => handleSearch(e, c.symbol)}
          >
            {c.symbol} – {c.companyName}
          </div>
        ))}
      </div>
    );
  }

  if (history.length) {
    return (
      <div style={dropdownStyle}>
        <button
          onClick={clearHistory}
          style={{
            width: "100%",
            padding: "0.5rem 1rem",
            textAlign: "left",
            background: "transparent",
            border: "none",
            color: "#f55",
            cursor: "pointer",
          }}
        >
          Clear History
        </button>
        {history.slice().reverse().map((h, i) => (
          <div
            key={h + i}
            style={{ padding: "0.5rem 1rem", cursor: "pointer", color: "#fff" }}
            onClick={(e) => handleSearch(e, h)}
          >
            {h}
          </div>
        ))}
      </div>
    );
  }

  return null;
}

function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<string[]>(
    () => JSON.parse(localStorage.getItem("searchHistory") || "[]")
  );
  const [results, setResults] = useState<Company[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const companyList = useRef<Company[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_PROXY_API_BASE_URL}/companylist/`)
      .then((r) => r.json())
      .then((data) => (companyList.current = data))
      .catch(console.error);
  }, []);

  const getSearchResults = (text: string) => {
    if (!text) {
      setShowHistory(true);
      return;
    }
    setShowHistory(false);
    const t = text.toLowerCase();
    setResults(
      companyList.current.filter(
        (c) =>
          c.symbol.toLowerCase().startsWith(t) ||
          c.companyName.toLowerCase().startsWith(t)
      )
    );
  };

  const handleSearch = async (
    e: React.MouseEvent | React.FormEvent,
    q: string
  ) => {
    e.preventDefault();
    if (!q.trim()) return;

    const url = `${import.meta.env.VITE_PROXY_API_BASE_URL}/realtime-prices/${q}`;
    const res = await fetch(url);
    if (!res.ok) {
      setShowDropdown(false);
      setShowHistory(true);
      setQuery("");
      return;
    }
    const data = await res.json();

    let h = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    h = h.filter((x: string) => x !== q);
    h.push(q);
    if (h.length > 5) h.shift();
    localStorage.setItem("searchHistory", JSON.stringify(h));
    setHistory(h);

    navigate(`/stock?ticker=${q}`, { state: { stock: data } });
    setQuery("");
    setShowDropdown(false);
    setShowHistory(true);
  };

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "20vw", margin: "0 1rem" }}
    >
      <form
        onSubmit={(e) => handleSearch(e, query)}
        style={{ position: "relative" }}
      >
        <FiSearch
          style={{
            position: "absolute",
            left: 10,
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
          onChange={(e) => {
            setQuery(e.target.value.toUpperCase());
            getSearchResults(e.target.value);
          }}
          onClick={() => {
            setShowDropdown(true);
            setShowHistory(true);
          }}
          style={{
            boxSizing: "border-box",
            background: "#000",
            color: "#fff",
            width: "100%",
            outline: "none",
        
            // 👇 new conditional borders:
            borderLeft: showDropdown ? "1px solid #333" : "1px solid #333",
            borderRight: showDropdown ? "1px solid #333" : "1px solid #333",
            borderTop: showDropdown ? "1px solid #333" : "1px solid #333",
            borderBottom: showDropdown ? "none"             : "1px solid #333",
        
            // 👇 corner‐rounding changes too:
            borderRadius: showDropdown ? "6px 6px 0 0" : "6px",
        
            // height / padding
            padding: "0.6rem 0.4rem 0.6rem 2rem",
            height: "2.5rem",
          }}
        />
      </form>

      {showDropdown && (
        <SearchDropdown
          history={history}
          showHistory={showHistory}
          results={results}
          handleSearch={handleSearch}
          setHistory={setHistory}
        />
      )}
    </div>
  );
}

export default Search;
