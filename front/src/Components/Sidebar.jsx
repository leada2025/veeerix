import React from "react";
import { NavLink } from "react-router-dom";
import veerixLogo from "../assets/v_logo.png";
import fishmanLogo from "../assets/FISHMAN BUSINESS SOLUTIONS.jpeg";
import { useSource } from "../Context/SourceContext";
import {
  Gauge,
  Home,
  FileText,
  ShoppingCart,
  PackageCheck,
  ChevronLeft,
  ChevronRight,
  Truck,
  Settings
} from "lucide-react";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { source } = useSource();
  const isFishman = source === "fishman";

  const sidebarBg = isFishman
    ? "bg-gradient-to-b from-[#7b4159] to-[#a56573]"
    : "bg-white";
  const sidebarText = isFishman ? "text-white" : "text-gray-700";
  const logoImg = isFishman ? fishmanLogo : veerixLogo;

  const navItems = [
    { label: "Dashboard ", path: "/fbsdashboard", icon: <Gauge size={20} /> },
    { label: "Dashboard", path: "/dashboard", icon: <Gauge size={20} /> },
    { label: "Request Quote", path: "/create-brand", icon: <Home size={20} /> },
    { label: "Trademark", path: "/trademark", icon: <FileText size={20} /> },
    { label: "Trademark Status", path: "/trademarks/track", icon: <FileText size={20} /> },
    { label: "Trademark History", path: "/trademarkh/history", icon: <FileText size={20} /> },
    { label: "Trademark Records", path: "/admin/my-registered", icon: <FileText size={20} /> },
   
    { label: "Design Approval", path: "/packing-approval", icon: <PackageCheck size={20} /> },
    { label: "Packing Status", path: "/packing/status", icon: <PackageCheck size={20} /> },
     { label: "Place Order", path: "/place-order", icon: <ShoppingCart size={20} /> },
    { label: "Distribution", path: "/distribution", icon: <Truck size={20} /> },
     { label: "Settings", path: "/settings", icon: <Settings size={20} /> },
  ];

  const visibleNavItems = navItems.filter((item) => {
    if (isFishman) {
      return (
        item.label === "Trademark" ||
        item.label === "Trademark Status" ||
        item.label === "Trademark History" ||
        item.label === "Trademark Records" ||
        item.label === "Dashboard "
      );
    } else {
      return (
        item.label !== "Trademark" &&
        item.label !== "Trademark Status" &&
        item.label !== "Trademark History" &&
        item.label !== "Trademark Records" &&
        item.label !== "Dashboard "
      );
    }
  });

  return (
    <aside
      className={`${sidebarBg} h-screen border-r border-gray-200 transition-all duration-300 ease-in-out ${
        collapsed ? "w-16" : "w-64"
      } shadow-lg flex flex-col`}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-300">
        {collapsed ? (
          <span className={`text-xl font-bold ${isFishman ? "text-white" : "text-[#d1383a]"}`}>
            {isFishman ? "FB" : "VB"}
          </span>
        ) : (
          <img src={logoImg} alt="Logo" className={isFishman ? "h-16 w-auto" : "h-12 w-auto"} />
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white transition"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="mt-4 flex flex-col gap-2 relative flex-1 overflow-auto">
        {visibleNavItems.map(({ label, path, icon }) => (
          <NavLink key={label} to={path} title={collapsed ? label : ""}>
            {({ isActive }) => (
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium relative transition-all
                  ${isActive
                    ? "bg-[#d1383a] text-white shadow-lg"
                    : `${sidebarText} hover:bg-white/20 hover:backdrop-blur-sm hover:shadow-sm transform hover:scale-105`
                  }`}
              >
                <div className="flex items-center justify-center">{icon}</div>
                {!collapsed && <span>{label}</span>}
                {/* Active indicator bar */}
                {isActive && !collapsed && (
                  <div className="absolute left-0 w-1 h-full bg-[#ff6b6b] rounded-r-md"></div>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="mt-auto px-4 py-6 text-sm text-gray-400 border-t border-gray-300">
          © {new Date().getFullYear()} {isFishman ? "Fishman" : "Veerix"}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
