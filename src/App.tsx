import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./pages/Home";
import StockPage from "./pages/StockPage";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute"; // ✅

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ✅ Protected Layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/stock" element={<StockPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
