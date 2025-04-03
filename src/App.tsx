// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./pages/Home";
import StockPage from "./pages/StockPage"; // ✅ import this
import Layout from "./components/Layout";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/stock" element={<StockPage />} /> {/* ✅ new route */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
