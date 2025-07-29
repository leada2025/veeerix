import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import veerix from "../../assets/veerixlogo.png"
import { useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  ClipboardList,
  DollarSign,
  Folder,
  Gift,
  Handshake,
  FileText,
  Home
} from "lucide-react";

const sidebarLinks = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    submenu: [],
    path: "/admin/",
  },
  {
    name: "Customers",
    icon: Users,
    submenu: [{  label: "Customer Details", path: "/admin/customer" },
    
],
  },
  {
    name: "Brand Requests",
    icon: Home,
    submenu: [
      { label: "Customer Requests", path: "/admin/molecule" },
        {  label: "Molecules", path: "/admin/addmolecule" },
     
    ],
  },
  {
    name: "Trademark",
    icon: FileText,
    submenu: [
      { label: "Trademark Requsets", path: "/admin/trademark" },
       { label: "Trademark History", path: "/admin/history" }
     
    ],
  },
  {
    name: "Packing Approval",
    icon: ClipboardList,
    submenu: [
      { label: "Customer Design", path: "/admin/packing" },
      { label: "PackingDesigns", path: "/admin/designs" },
       { label: "PackingStatus", path: "/admin/packingtrack" },
    ],
  },
   {
    name: "Order Management",
    icon: ClipboardList,
    submenu: [
      { label: "Orders", path: "/admin/orders" },
   ,
    ],
  },


];

export default function AdminSidebar() {
  const [activeMain, setActiveMain] = useState("Dashboard");
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
const location = useLocation();
  const selectedItem = sidebarLinks.find((item) => item.name === activeMain);

  return (
    <div className="flex h-screen font-sans">
      {/* Sidebar */}
      <aside
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={`bg-[#d1383a] text-white transition-all duration-300 ${
          isExpanded ? "w-56" : "w-20"
        } flex flex-col py-6 shadow-md`}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src={veerix}
            alt="Logo"
            className="w-64 px-1"
          />
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
                  if (item.path) navigate(item.path);
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                  isActive ? "bg-white text-[#d1383a]" : "hover:bg-white/10"
                }`}
              >
                <Icon size={20} className={isActive ? "text-[#d1383a]" : "text-white"} />
                {isExpanded && <span className="whitespace-nowrap">{item.name}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Submenu */}
     {selectedItem?.submenu?.length > 0 && (
  <aside className="w-64 bg-[#F8FAFC] p-6 border-l border-gray-200">
    <h2 className="text-lg font-semibold text-[#10223E] mb-4">
      {selectedItem.name}
    </h2>
    <div className="space-y-2">
      {selectedItem.submenu.map((sub, index) => {
        const isSubActive = location.pathname === sub.path;
        return (
          <button
            key={index}
            onClick={() => navigate(sub.path)}
            className={`block w-full text-left text-sm px-4 py-2 rounded ${
              isSubActive
                ? "bg-[#d1383a] text-white"
                : "hover:bg-[#E2F9F7] text-[#10223E]"
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
