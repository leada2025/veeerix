import React, { useState } from "react";
import { Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSource } from "../Context/SourceContext";
import { useNotifications } from "../Context/NotificationContext";
import useGlobalNotificationChecker from "../Components/useGlobalNotificationChecker";

export default function Navbar() {
  const { source } = useSource();
  const navigate = useNavigate();
  const { hasNotification, clearNotifications, messages } = useNotifications();
  const [open, setOpen] = useState(false);
const { bellSeen, addNotification,  markBellSeen } = useNotifications();

  // 🔑 get userId from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const customerId = storedUser?.id;

  // 🔔 run global notification checker
  useGlobalNotificationChecker(customerId);

  const navbarBg =
    source === "fishman"
      ? "bg-gradient-to-r from-[#7b4159] to-[#a56573]"
      : "bg-[#d1383a]";
  const brandName =
    source === "fishman"
      ? "Fishman Business Solutions"
      : "Manufacturing Tracker";

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };
const handleBellClick = () => {
  setOpen(prev => !prev);
  markBellSeen(); // stop blinking when opened

  // ✅ Persist seen time for packing
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const customerId = storedUser?.id;
  if (customerId) {
    const now = Date.now();
    localStorage.setItem(
      `packingSeen_${customerId}`,
      JSON.stringify({ status: now, history: now })  // mark both as seen
    );
  }
};

  return (
    <header
      className={`${navbarBg} text-white h-[60px] flex items-center justify-between px-6 shadow-lg sticky top-0 z-50`}
    >
      {/* Brand / Logo */}
      <span className="text-xl font-bold tracking-wide">{brandName}</span>

      {/* Right Actions */}
      <div className="flex items-center gap-4 relative">
        {/* Notification Bell */}
       <button
    onClick={handleBellClick}
    className="relative p-2 rounded-full hover:bg-white/20 transition"
  >
    <Bell size={22} />
    {!bellSeen && messages.length > 0 && (
      <span className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full animate-ping"></span>
    )}
  </button>

        {/* Notification dropdown */}
      {/* Notification dropdown */}
{open && (
  <div className="absolute right-0 top-12 bg-white text-black rounded-lg shadow-lg w-64 p-3 max-h-64 overflow-y-auto">
    {messages.length === 0 ? (
      <p className="text-sm text-gray-500">No new notifications</p>
    ) : (
      <ul className="space-y-2">
       {messages.map((notif, i) => (
  <li
    key={i}
    className="text-sm border-b pb-1 cursor-pointer hover:bg-gray-100 rounded px-1"
    onClick={() => {
      navigate(notif.link);   // 👈 navigate to correct page
      markBellSeen();          // stop bell blink
      setOpen(false);          // close dropdown
    }}
  >
    {notif.message}
  </li>
))}
      </ul>
    )}
    <div className="flex justify-between mt-3">
 
      <button
        onClick={clearNotifications}
        className="text-gray-500 text-sm"
      >
        Clear
      </button>
    </div>
  </div>
)}


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
