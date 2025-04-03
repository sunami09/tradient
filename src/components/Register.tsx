// src/pages/Register.tsx
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="left-pane">
        <div className="background-animation">
          {[...Array(100)].map((_, i) => {
            const row = Math.floor(i / 10);
            return (
              <div
                className={`bar row-${row % 2 === 0 ? "even" : "odd"}`}
                key={i}
                style={{
                  animationDelay: `${Math.random() * 2}s`,
                  height: `${30 + Math.random() * 50}px`,
                }}
              ></div>
            );
          })}
        </div>
      </div>

      <div className="right-pane">
        <h2>
          Create your <span className="brand">Tradient</span> account
        </h2>

        <form onSubmit={handleRegister}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button className="login" type="submit" disabled={loading}>
            {loading ? <div className="spinner" /> : "Register"}
          </button>
          {error && <p className="error">{error}</p>}
        </form>

        <p className="register-text">
          Already have an account?{" "}
          <Link className="register-link" to="/login">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
