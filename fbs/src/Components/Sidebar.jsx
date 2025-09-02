import React from "react";
import { NavLink } from "react-router-dom";
import fishmanLogo from "../assets/FISHMAN BUSINESS SOLUTIONS.jpeg";
import {
  Gauge,
  Home,
  FileText,
  ShoppingCart,
  PackageCheck,
  Truck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const sidebarBg = "bg-[#7b4159]";
  const logoImg = fishmanLogo;

  const navItems = [
    { label: "Dashboard", path: "/fbsdashboard", icon: <Gauge size={20} /> },
    { label: "Trademark", path: "/trademark", icon: <FileText size={20} /> },
    { label: "Trademark Status", path: "/trademarks/track", icon: <FileText size={20} /> },
    { label: "Trademark History", path: "/trademarkh/history", icon: <FileText size={20} /> },
    { label: "Trademark Records", path: "/admin/my-registered", icon: <FileText size={20} /> },
  ];

  return (
    <aside
      className={`${sidebarBg} h-screen flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-400">
        {!collapsed ? (
          <img src={logoImg} alt="Fishman Logo" className="h-16 w-auto" />
        ) : (
          <span className="text-xl font-bold text-white">FB</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-200 hover:text-white transition"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-4 overflow-y-auto px-1">
        {navItems.map(({ label, path, icon }) => (
          <NavLink
            key={label}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${isActive ? "bg-white text-[#7b4159] shadow-md" : "text-white hover:bg-white/20"}`
            }
            title={collapsed ? label : ""}
          >
            {icon}
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-gray-400 text-xs text-white italic mt-auto">
          Fishman Business Solutions
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
