// pages/tradingprofile.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

type Env = "paper" | "live";

const PROXY_URL = import.meta.env.VITE_PROXY_API_BASE_URL

function Toast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const id = setTimeout(onClose, 3000);
    return () => clearTimeout(id);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "#333",
        color: "white",
        padding: "1rem 2rem",
        borderRadius: "8px",
        zIndex: 9999,
        boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
        textAlign: "center",
      }}
    >
      {message}
    </div>
  );
}

function TradingProfile() {
  const [env, setEnv] = useState<Env>("paper");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Prevent page scrolling
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Load existing profile
  useEffect(() => {
    async function fetchProfile() {
      const user = auth.currentUser;
      if (!user) {
        setInitialLoading(false);
        return;
      }
      
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        if (data.alpacaKey && data.alpacaSecret) {
          setEnv((data.alpacaEnv as Env) || "paper");
          
          // We have encrypted credentials - verify they still work
          try {
            const verifyResponse = await fetch(`${PROXY_URL}/verify-encrypted`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                encryptedKey: data.alpacaKey,
                encryptedSecret: data.alpacaSecret,
                env: data.alpacaEnv || 'paper'
              })
            });
            
            const verifyData = await verifyResponse.json();
            setIsVerified(verifyData.success);
            
            // Don't show the actual keys, just placeholders
            setApiKey("••••••••••••••••••••");
            setApiSecret("••••••••••••••••••••••••••••••");
            setIsEditing(false);
          } catch (error) {
            console.error("Error verifying credentials:", error);
            setIsVerified(false);
            setIsEditing(true);
          }
        }
      }
      setInitialLoading(false);
    }
    fetchProfile();
  }, []);

  const getBaseUrl = () =>
    env === "paper"
      ? "https://paper-api.alpaca.markets"
      : "https://api.alpaca.markets";

  const verifyCredentials = async () => {
    setIsVerifying(true);
    try {
      // Direct verification with Alpaca
      const res = await fetch(`${getBaseUrl()}/v2/account`, {
        headers: {
          "APCA-API-KEY-ID": apiKey.trim(),
          "APCA-API-SECRET-KEY": apiSecret.trim(),
        },
      });
      if (!res.ok) throw new Error();
      setIsVerified(true);
      setToastMessage("✅ Credentials verified!");
    } catch {
      setIsVerified(false);
      setToastMessage("❌ Verification failed.");
    } finally {
      setIsVerifying(false);
    }
  };

  const saveTradingProfile = async () => {
    const user = auth.currentUser;
    if (!user) {
      setToastMessage("⚠️ Not logged in");
      return;
    }
    
    try {
      // First encrypt the credentials using your proxy
      const encryptResponse = await fetch(`${PROXY_URL}/encrypt-credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          apiSecret: apiSecret.trim(),
          env: env
        })
      });
      
      const encryptData = await encryptResponse.json();
      
      if (!encryptData.success) {
        throw new Error(encryptData.message || 'Failed to encrypt credentials');
      }
      
      // Save the encrypted credentials to Firebase
      await setDoc(
        doc(db, "users", user.uid),
        {
          alpacaEnv: env,
          alpacaKey: encryptData.encryptedKey,     // Store encrypted key
          alpacaSecret: encryptData.encryptedSecret, // Store encrypted secret
          lastUpdated: new Date().toISOString()
        },
        { merge: true }
      );
      
      navigate("/");
    } catch (error) {
      console.error('Error saving credentials:', error);
      setToastMessage(`❌ Save failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (initialLoading) return null;

  return (
    <div
      style={{
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem",
        background: "#0d0d0d",
        color: "white",
        height: "100vh",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ marginBottom: "0.5rem" }}>Trading Profile</h2>
      <p
        style={{
          maxWidth: 400,
          textAlign: "center",
          marginBottom: "2rem",
          lineHeight: 1.4,
        }}
      >
        To get your API Key & Secret, sign up at Alpaca and in your dashboard go
        to "API Keys" to generate them.
        Api: PKBGF7MYZYTG44EBH0I4
        Sec: PzxmPQ1ZJmF1bW9EB7sQfQdpOdxhtPO4tAGN85Mo
        
      </p>

      {/* Toggle switch */}
      <div style={{ marginBottom: "2rem", pointerEvents: isEditing ? "auto" : "none" }}>
        <div
          onClick={() => {
            if (!isEditing) return;
            setEnv(env === "paper" ? "live" : "paper");
            setIsVerified(false);
          }}
          style={{
            width: "80px",
            height: "30px",
            borderRadius: "15px",
            background: env === "live" ? "#00ff99" : "#555",
            position: "relative",
            cursor: isEditing ? "pointer" : "default",
            transition: "background 0.3s",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "2px",
              left: env === "live" ? "calc(100% - 28px)" : "2px",
              width: "26px",
              height: "26px",
              borderRadius: "50%",
              background: "white",
              transition: "left 0.3s",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "80px",
            margin: "0.5rem auto 0",
            fontSize: "0.9rem",
          }}
        >
          <span style={{ opacity: env === "paper" ? 1 : 0.6 }}>Paper</span>
          <span style={{ opacity: env === "live" ? 1 : 0.6 }}>Live</span>
        </div>
      </div>

      {/* Inputs */}
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <input
          type="text"
          placeholder="API Key"
          value={apiKey}
          disabled={!isEditing}
          onChange={(e) => {
            setApiKey(e.target.value);
            setIsVerified(false);
          }}
          style={{
            width: "100%",
            padding: "1rem",          // increased padding
            borderRadius: "6px",
            border: "1px solid #555",
            background: "#1a1a1a",
            color: "white",
            outline: "none",
            opacity: isEditing ? 1 : 0.6,
          }}
        />
        <input
          type="text"
          placeholder="API Secret"
          value={apiSecret}
          disabled={!isEditing}
          onChange={(e) => {
            setApiSecret(e.target.value);
            setIsVerified(false);
          }}
          style={{
            width: "100%",
            padding: "1rem",          // increased padding
            borderRadius: "6px",
            border: "1px solid #555",
            background: "#1a1a1a",
            color: "white",
            outline: "none",
            opacity: isEditing ? 1 : 0.6,
          }}
        />
      </div>

      {/* Actions */}
      <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
        {isEditing ? (
          <>
            <button
              onClick={verifyCredentials}
              disabled={
                isVerifying ||
                isVerified ||
                !apiKey.trim() ||
                !apiSecret.trim()
              }
              style={{
                padding: "1rem 1.5rem",   // bigger button
                borderRadius: "999px",
                background: isVerified ? "#555" : "#00ff99",
                color: "black",
                fontWeight: "bold",
                fontSize: "1.1rem",       // larger font
                cursor:
                  isVerifying || isVerified ? "not-allowed" : "pointer",
                opacity: isVerifying || isVerified ? 0.6 : 1,
                border: "none",
                outline: "none",
                minWidth: "120px",        // wider
              }}
            >
              {isVerifying ? "Verifying…" : isVerified ? "Verified ✓" : "Verify"}
            </button>
            <button
              onClick={saveTradingProfile}
              disabled={!isVerified}
              style={{
                padding: "1rem 1.5rem",   // bigger button
                borderRadius: "999px",
                background: isVerified ? "#00ff99" : "#555",
                color: "black",
                fontWeight: "bold",
                fontSize: "1.1rem",       // larger font
                cursor: isVerified ? "pointer" : "not-allowed",
                opacity: isVerified ? 1 : 0.6,
                border: "none",
                outline: "none",
                minWidth: "120px",        // wider
              }}
            >
              Save
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: "1rem 2.5rem",   // bigger button
              borderRadius: "999px",
              background: "#00ff99",
              color: "black",
              fontWeight: "bold",
              fontSize: "1.1rem",       // larger font
              cursor: "pointer",
              border: "none",
              outline: "none",
            }}
          >
            Edit
          </button>
        )}
      </div>

      {/* External link */}
      <p style={{ marginTop: "2rem", fontSize: "0.9rem" }}>
        <a
          href="https://alpaca.markets"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#00ff99", textDecoration: "underline" }}
        >
          Go to Alpaca »
        </a>
      </p>

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
}

export default TradingProfile;