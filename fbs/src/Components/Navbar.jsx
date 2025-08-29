import React from "react";
import { Bell, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSource } from "../Context/SourceContext";

export default function Navbar() {
  const { source } = useSource();
  const navigate = useNavigate();

  const navbarBg = source === "fishman" ? "bg-[#7b4159]" : "bg-[#d1383a]";
  const brandName = source === "fishman" ? "Fishman Business Solutions" : "Veerix";

const handleLogout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  // ✅ seenChats_* and counters remain untouched
  navigate("/");
};


  return (
    <header className={`h-[60px] ${navbarBg} text-white flex items-center justify-between px-6 shadow-md`}>
      <h1 className="text-lg font-semibold">{brandName}</h1>
      <div className="flex items-center gap-4">
        <button className="hover:text-gray-200">
          <Bell size={20} />
        </button>
        <button className="hover:text-gray-200">
          <User size={20} />
        </button>
        <button onClick={handleLogout} className="hover:text-gray-200 flex items-center gap-1">
          <LogOut size={18} />
          <span className="text-sm hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
