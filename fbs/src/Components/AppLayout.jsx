import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const AppLayout = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const activeBrand = localStorage.getItem("activeBrand"); // <- key part
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const isFishman = activeBrand === "fishman";
    const allowedPaths = ["/trademark"];
    if (isFishman && !allowedPaths.includes(location.pathname)) {
      navigate("/trademark");
    }
  }, [activeBrand, location.pathname, navigate]);

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex flex-col flex-1">
        <Navbar />
        <main className="flex-1 bg-gray-50 p-4 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
