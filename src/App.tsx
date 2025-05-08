// App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./pages/Home";
import StockPage from "./pages/StockPage";
import Profile from "./pages/Profile";
import UpdateProfile from "./pages/UpdateProfile";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import TradingProfile from "./pages/TradingProfile"; 
import Community from "./pages/Community";
import CommunityProfileSetup from "./pages/CommunityProfileSetup"; // NEW
import CommunityGuard from "./components/CommunityGuard"; // NEW
import PostDetail from "./components/PostDetail";

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
          <Route path="/profile" element={<Profile />} />
          <Route path="/update-profile" element={<UpdateProfile />} />
          <Route path="/trading-profile" element={<TradingProfile />} />
          
          {/* Community routes */}
          <Route path="/community" element={<CommunityGuard />} />
          <Route path="/community-setup" element={<CommunityProfileSetup />} />
          <Route path="/community/post/:postId" element={<PostDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}



export default App;