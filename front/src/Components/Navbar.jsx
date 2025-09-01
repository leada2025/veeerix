import React from "react";
import { Bell, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSource } from "../Context/SourceContext";

export default function Navbar() {
  const { source } = useSource();
  const navigate = useNavigate();

  const navbarBg =
    source === "fishman" ? "bg-gradient-to-r from-[#7b4159] to-[#a56573]" : "bg-[#d1383a]";
  const brandName =
    source === "fishman" ? "Fishman Business Solutions" : "Veerix";

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <header
      className={`${navbarBg} text-white h-[60px] flex items-center justify-between px-6 shadow-lg backdrop-blur-sm sticky top-0 z-50`}
    >
      {/* Brand / Logo */}
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold tracking-wide">{brandName}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        {/* <button className="relative p-2 rounded-full hover:bg-white/20 transition">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        </button> */}

        {/* User Profile */}
        {/* <button className="flex items-center gap-2 p-2 rounded-full hover:bg-white/20 transition">
          <User size={20} />
          <span className="text-sm hidden sm:inline">Profile</span>
        </button> */}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1 bg-white/20 hover:bg-white/30 transition rounded-full"
        >
          <LogOut size={18} />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </header>
  );
}
