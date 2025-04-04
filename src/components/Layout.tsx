// src/components/Layout.tsx
import NavBar from "./NavBar";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <>
      <NavBar />
      {/* Add padding-top to push the content below the fixed navbar */}
      <div style={{ paddingTop: "70px" }}>
        <Outlet />
      </div>
    </>
  );
}

export default Layout;
