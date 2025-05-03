import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

interface PortfolioValueDisplayProps {
  initialValue?: number;
  historicalValue?: number | null;
  isHovering?: boolean;
}

const PortfolioValueDisplay: React.FC<PortfolioValueDisplayProps> = ({
  initialValue = 0,
  historicalValue = null,
  isHovering = false,
}) => {
  const [currentValue, setCurrentValue] = useState<number>(initialValue);
  const [valueColor, setValueColor] = useState<string>("white");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dailyChange, setDailyChange] = useState<number>(0);
  const [dailyChangePercent, setDailyChangePercent] = useState<number>(0);
  const [isPositive, setIsPositive] = useState<boolean>(true);
  const [alpacaKey, setAlpacaKey] = useState<string>("");
  const [alpacaSecret, setAlpacaSecret] = useState<string>("");

  const abortControllerRef = useRef<AbortController | null>(null);

  // Load Alpaca credentials once
  useEffect(() => {
    (async () => {
      if (!auth.currentUser) return;
      try {
        const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userSnap.exists()) {
          const data = userSnap.data();
          // Fix: Make sure the key names match what's used in PortfolioChart
          setAlpacaKey(data.alpacaKey || data.alpacakey || "");
          setAlpacaSecret(data.alpacaSecret || data.alpacasecret || "");
        }
      } catch (err) {
        console.error("Error fetching Alpaca credentials:", err);
      }
    })();
  }, []);

  // Fetch portfolio when credentials or initialValue change
  useEffect(() => {
    if (!alpacaKey || !alpacaSecret) return;
    if (abortControllerRef.current) abortControllerRef.current.abort();

    const fetchData = async () => {

      
      setIsLoading(true);

      abortControllerRef.current = new AbortController();
      try {
        const url = `${import.meta.env.VITE_PROXY_API_BASE_URL}/portfolio?encryptedKey=${alpacaKey}&encryptedSecret=${alpacaSecret}&period=1D&timeframe=1H`;
        const resp = await fetch(url, { signal: abortControllerRef.current.signal });
        if (!resp.ok) throw new Error(`Fetch error: ${resp.status}`);
        const data: { prices: number[] } = await resp.json();
        if (data.prices?.length) {
          const latest = data.prices[data.prices.length - 1];
          const open = data.prices[0];
          
          setCurrentValue(latest);
          
          const change = latest - open;
          const pct = (change / open) * 100;
          setDailyChange(change);
          setDailyChangePercent(pct);
          setIsPositive(change >= 0);
          setValueColor(change >= 0 ? "rgb(0, 200, 5)" : "#ff5000");
        } else {
          console.warn("Received empty prices array in response");
        }
      } catch (e) {
        if ((e as Error).name !== 'AbortError') console.error("Fetch error:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    return () => { abortControllerRef.current?.abort(); };
  }, [alpacaKey, alpacaSecret]);

  // Poll every minute
  useEffect(() => {
    if (!alpacaKey || !alpacaSecret) return;
    const id = setInterval(() => {
      abortControllerRef.current?.abort();
      (async () => {
        setIsLoading(true);
        abortControllerRef.current = new AbortController();
        try {
          const url = `${import.meta.env.VITE_PROXY_API_BASE_URL}/portfolio?encryptedKey=${alpacaKey}&encryptedSecret=${alpacaSecret}&period=1D&timeframe=1H`;
          const resp = await fetch(url, { signal: abortControllerRef.current.signal });
          if (!resp.ok) throw new Error(`Fetch error: ${resp.status}`);
          const d: { prices: number[] } = await resp.json();
          if (d.prices?.length) {
            const last = d.prices.at(-1)!;
            const open = d.prices[0];
            setCurrentValue(last);
            const ch = last - open;
            const pc = (ch / open) * 100;
            setDailyChange(ch);
            setDailyChangePercent(pc);
            setIsPositive(ch >= 0);
            setValueColor(ch >= 0 ? "rgb(0, 200, 5)" : "#ff5000");
          }
        } catch (e) {
          if ((e as Error).name !== 'AbortError') console.error(e);
        } finally {
          setIsLoading(false);
        }
      })();
    }, 60000);
    return () => clearInterval(id);
  }, [alpacaKey, alpacaSecret]);

  // Show historical on hover
  useEffect(() => {
    if (isHovering && historicalValue != null) {
      setCurrentValue(historicalValue);
    } else if (!isHovering && historicalValue != null) {
      // This ensures we revert to the actual current value when not hovering
      // Don't set it to initialValue which might be 0
      abortControllerRef.current?.abort();
      (async () => {
        try {
          const url = `${import.meta.env.VITE_PROXY_API_BASE_URL}/portfolio?encryptedKey=${alpacaKey}&encryptedSecret=${alpacaSecret}&period=1D&timeframe=1H`;
          const resp = await fetch(url);
          if (!resp.ok) throw new Error(`Fetch error: ${resp.status}`);
          const data: { prices: number[] } = await resp.json();
          if (data.prices?.length) {
            const latest = data.prices[data.prices.length - 1];
            setCurrentValue(latest);
          }
        } catch (e) {
          console.error("Error reverting to current value:", e);
        }
      })();
    }
  }, [isHovering, historicalValue, alpacaKey, alpacaSecret]);

  const display = isHovering && historicalValue != null ? historicalValue : currentValue;
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  return (
    <div style={{ position: 'relative', height: '60px' }}>
      <h3 style={{ fontSize: '2rem', color: isHovering ? 'white' : valueColor, transition: 'color .3s', marginBottom: '0.5rem' }}>
        ${fmt(display)}
      </h3>
      <div style={{
        fontSize: '1rem',
        color: isPositive ? 'rgb(0, 200, 5)' : '#ff5000',
        opacity: isHovering ? 0 : 1,
        transition: 'opacity .3s',
        position: 'absolute',
        top: '40px'
      }}>
        {(isPositive ? '+' : '')}{fmt(dailyChange)} ({(isPositive ? '+' : '')}{dailyChangePercent.toFixed(2)}%) Today
      </div>
      {isLoading && (
        <div style={{ position: 'absolute', right: '-25px', top: '50%', transform: 'translateY(-50%)' }}>
          <div style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            border: '2px solid rgba(204,247,89,0.2)',
            borderTopColor: 'rgba(204,247,89,1)',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default PortfolioValueDisplay;