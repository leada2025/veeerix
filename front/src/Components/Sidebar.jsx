import React from "react";
import { NavLink } from "react-router-dom";
import veerixLogo from "../assets/v_logo.png";
import fishmanLogo from "../assets/FISHMAN BUSINESS SOLUTIONS.jpeg";
import { useSource } from "../Context/SourceContext";
import {
  Home,
  FileText,
  ShoppingCart,
  Info,
  PackageCheck,
  ChevronLeft,
  ChevronRight,
  Truck,
} from "lucide-react";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { source } = useSource();

  const isFishman = source === "fishman";
  const hideTrademark = source === "veerix";

  const sidebarBg = isFishman ? "bg-[#7b4159]" : "bg-white";
  const sidebarText = isFishman ? "text-white" : "text-gray-700";
  const logoImg = isFishman ? fishmanLogo : veerixLogo;

  const navItems = [
    { label: "Create Your Brand", path: "/create-brand", icon: <Home size={20} /> },
    { label: "Trademark", path: "/trademark", icon: <FileText size={20} /> },
     { label: "Trademark Status", path: "/trademarks/track", icon: <FileText size={20} /> },
{ label: "Trademark History", path: "/trademarkh/history", icon: <FileText size={20} /> },

    { label: "Place Order", path: "/place-order", icon: <ShoppingCart size={20} /> },
    { label: "Packing Approval", path: "/packing-approval", icon: <PackageCheck size={20} /> },
    { label: "Packing Status", path: "/packing/status", icon: <PackageCheck size={20} /> },
      { label: "Packing History", path: "/packing-history", icon: <PackageCheck size={20} /> },

    { label: "Status", path: "/status", icon: <Info size={20} /> },
    { label: "Distribution", path: "/distribution", icon: <Truck size={20} /> },
  ];

const visibleNavItems = navItems.filter((item) => {
  if (isFishman) {
  return (
    item.label === "Trademark" ||
    item.label === "Trademark Status" ||
    item.label === "Trademark History"
  );


  } else {
    // For Veerix, hide Trademark-related pages
    return item.label !== "Trademark" && item.label !== "Trademark Status"  && item.label !== "Trademark History";
  }
});



  return (
    <aside
      className={`${sidebarBg} h-screen border-r transition-all duration-300 ease-in-out ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-300">
        {collapsed ? (
          <span className={`text-xl font-bold ${isFishman ? "text-white" : "text-black"}`}>
            {isFishman ? "FB" : "VB"}
          </span>
        ) : (
          <img
            src={logoImg}
            alt="Logo"
            className={isFishman ? "h-16 w-auto" : "h-12 w-auto"}
          />
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white ml-auto"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="mt-4 flex flex-col gap-1">
        {visibleNavItems.map(({ label, path, icon }) => (
          <NavLink
            key={label}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition
              ${
                isFishman
                  ? isActive
                    ? "bg-white text-[#7b4159]"
                    : "bg-[#7b4159] text-white hover:bg-[#ffffff20]"
                  : isActive
                  ? "bg-[#d1383a] text-white shadow"
                  : "text-gray-700 hover:bg-[#f0f9ff]"
              }`
            }
          >
            {icon}
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
