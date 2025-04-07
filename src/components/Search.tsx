import { FiSearch } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";

function SearchDropdown(props) {
    const clearHistory = () => {
        localStorage.clear();
        props.setHistory([]);
    }

    if (!props.showHistory) {
        return (
        <div style={{ position: "absolute", background: "black", border: "1px solid green", padding: "1rem" }}>
            {props.results.slice().reverse().map((result, index) => (
                <div key={result.symbol || index}>
                    <p key={index} style={{ cursor: "pointer" }} onClick={(e) => {
                        e.preventDefault();
                        props.handleSearch(e, result.symbol)
                    }}>{result.symbol} - {result.companyName}</p>
                </div>
            ))}
        </div>
        )
    }

    if (props.history.length != 0 && props.showHistory) {
        return (
        <div>
            <button onClick={clearHistory}>Clear Search History</button>
            <div style={{ position: "absolute", background: "black", border: "1px solid green", padding: "1rem" }}>
                {props.history.slice().reverse().map((result, index) => (
                    <p key={index} style={{ cursor: "pointer" }} onClick={(e) => {
                        e.preventDefault();
                        props.handleSearch(e, result)
                    }}>{result}</p>
                ))}
            </div>
        </div>
    ) }
}

function Search(props) {
    const [history, setHistory] = useState(JSON.parse(localStorage.getItem('searchHistory')) || []);
    const [results, setResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showHistory, setShowHistory] = useState(true);
    const companyList = useRef([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Hide search dropdown when click outside of form
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Add search history to localStorage, limit of 5 items
    const addToHistory = (searchItem: string) => {
        let cache = JSON.parse(localStorage.getItem('searchHistory')) || [];
        cache = cache.filter(item => item !== searchItem);
        cache.push(searchItem);
        if (cache.length > 5) {
            cache.shift();
        }
        localStorage.setItem('searchHistory', JSON.stringify(cache));
        setHistory([...cache]);
        setShowDropdown(false);
        setShowHistory(true);
    };

    // Fetch entire company list only once and save to ref
    useEffect(() => {
        const fetchCompanyList = async () => {
            const url = `${import.meta.env.VITE_PROXY_API_BASE_URL}/companylist/`;
    
            try {
                const res = await fetch(url);    
                if (!res.ok) {
                    console.error(`Error: ${res.status} - ${res.statusText}`);
                    return;
                }
                const data = await res.json();
                companyList.current = data;
            } catch (err) {
                console.error("Fetching failed:", err);
            }
        };
    
        fetchCompanyList();
    }, []);

    // Filter company list for search input
    const getSearchResults = async (query) => {
        const text = query.toLowerCase();
        if (!text) {
            setShowHistory(true);
            return
        }
        try {
            const filteredResults = companyList.current.filter(str => (str.symbol.toLowerCase().startsWith(text) || (str.companyName.toLowerCase().startsWith(text))));
            setResults(filteredResults);
        } catch (err) {
            console.error("Search failed", err);
        }
    }

    const handleSearch = async (e: React.FormEvent, query) => {
        e.preventDefault();
        if (!query.trim()) return;

        const url = `${import.meta.env.VITE_PROXY_API_BASE_URL}/realtime-prices/${query}`;
        try {
            const res = await fetch(url);

            if (!res.ok) {
                console.error(`Error: ${res.status} - ${res.statusText}`);
                if (res.status === 404) {
                    console.log("Not a valid query");
                }
                setShowDropdown(false);
                setShowHistory(true);
                props.setQuery(""); 
                return;
            }
            const data = await res.json();
            addToHistory(query);
            props.navigate(`/stock?ticker=${query}`, { state: { stock: data } });
            props.setQuery(""); 
        } catch (err) {
            console.error("Search failed", err);
        }
    };

    return (
        <div ref={containerRef} style={{ position: "relative" }}>
            <form
                onSubmit={(e) => handleSearch(e, props.query)}
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
                    value={props.query}
                    onChange={(e) => {
                        setShowHistory(false);
                        props.setQuery(e.target.value.toUpperCase());
                        getSearchResults(e.target.value);
                    }}
                    onClick={() => setShowDropdown(true)}
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
            {showDropdown && (
                <SearchDropdown 
                    history={history} 
                    setHistory={setHistory} 
                    showHistory={showHistory} 
                    getSearchResults={getSearchResults}
                    handleSearch={handleSearch}
                    results={results} />
            )}
        </div>
    );
}

export default Search;