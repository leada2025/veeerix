import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import veerixLogo from "../../assets/veerixlogo.png";
import fishmanLogo from "../../assets/FISHMAN BUSINESS SOLUTIONS.jpeg";
import { useSource } from "../../Context/SourceContext";

import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  Home,
  Package,
  ShoppingCart,
} from "lucide-react";

const veerixSidebarLinks = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
  },
  {
    name: "Customers",
    icon: Users,
    submenu: [{ label: "Customer Details", path: "/admin/customer" }],
  },
  {
    name: "Brand Requests",
    icon: Home,
    submenu: [
      { label: "Customer Requests", path: "/admin/molecule" },
      { label: "Molecules", path: "/admin/addmolecule" },
    ],
  },
  {
    name: "Packing Approval",
    icon: ClipboardList,
    submenu: [
      { label: "Customer Design", path: "/admin/packing" },
      { label: "Packing Designs", path: "/admin/designs" },
      { label: "Packing Status", path: "/admin/packingtrack" },
    ],
  },
  {
    name: "Order Management",
    icon: ShoppingCart,
    submenu: [{ label: "Customer's Orders", path: "/admin/orders" }],
  },
  
];

const fishmanSidebarLinks = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin/fbsdashboard",
  },
  {
    name: "Trademark",
    icon: FileText,
    submenu: [
      { label: "Trademark Requests", path: "/admin/trademark" },
      { label: "Trademark History", path: "/admin/history" },
    ],
  },

];

export default function AdminSidebar() {
  const [activeMain, setActiveMain] = useState("Dashboard");
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { source } = useSource();
  const isFishman = source === "fishman";

  // Pick sidebar config based on source
  const sidebarLinks = isFishman ? fishmanSidebarLinks : veerixSidebarLinks;
  const logo = isFishman ? fishmanLogo : veerixLogo;

  const selectedItem = sidebarLinks.find((item) => item.name === activeMain);

  return (
    <div className="flex h-screen font-sans">
      {/* Sidebar */}
      <aside
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={`${
          isFishman ? "bg-[#7b4159]" : "bg-[#d1383a]"
        } text-white transition-all duration-300 ${
          isExpanded ? "w-56" : "w-20"
        } flex flex-col py-6 shadow-md`}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="w-40 px-2" />
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col space-y-1 px-2">
          {sidebarLinks.map((item) => {
            const Icon = item.icon;
            const isActive = activeMain === item.name;

            return (
              <button
  key={item.name}
  onClick={() => {
    setActiveMain(item.name);
    if (item.path) {
      navigate(item.path);
    } else if (item.submenu?.length > 0) {
      navigate(item.submenu[0].path);
    }
  }}
  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
    isActive
      ? isFishman
        ? "bg-white text-[#7b4159]" // ✅ Fishman active color
        : "bg-white text-[#d1383a]" // ✅ Veerix active color
      : "hover:bg-white/10"
  }`}
>
  <Icon
    size={20}
    className={
      isActive
        ? isFishman
          ? "text-[#7b4159]" // ✅ Fishman icon color
          : "text-[#d1383a]" // ✅ Veerix icon color
        : "text-white"
    }
  />
  {isExpanded && (
    <span className="whitespace-nowrap">{item.name}</span>
  )}
</button>

            );
          })}
        </nav>
      </aside>

      {/* Submenu */}
{/* Submenu */}
{selectedItem?.submenu?.length > 0 && (
  <aside className="w-64 bg-[#F8FAFC] p-6 border-l border-gray-200">
    <h2 className="text-lg font-semibold text-[#10223E] mb-4">
      {selectedItem.name}
    </h2>
    <div className="space-y-2">
      {selectedItem.submenu.map((sub, index) => {
        const isSubActive = location.pathname === sub.path;

        // 🎨 Dynamic colors
        const activeBg = isFishman ? "bg-[#7b4159]" : "bg-[#d1383a]";
        const activeText = "text-white";
        const hoverBg = isFishman ? "hover:bg-[#F3E6EB]" : "hover:bg-[#E2F9F7]";
        const hoverText = "text-[#10223E]";

        return (
          <button
            key={index}
            onClick={() => navigate(sub.path)}
            className={`block w-full text-left text-sm px-4 py-2 rounded ${
              isSubActive
                ? `${activeBg} ${activeText}`
                : `${hoverBg} ${hoverText}`
            }`}
          >
            {sub.label}
          </button>
        );
      })}
    </div>
  </aside>
)}

    </div>
  );
}
