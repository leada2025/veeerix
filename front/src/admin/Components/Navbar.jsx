import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { FiSettings, FiLogOut } from "react-icons/fi";

export default function AdminNavbar({ onLogout, navigate }) {
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const [role, setRole] = useState(null);
  const settingsRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole?.toLowerCase() || null);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setSettingsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getCurrentPageTitle = () => {
    const pathname = location.pathname.toLowerCase();
    const pageMap = [
      { path: "customer", label: "Customers" },
      { path: "orders", label: "Orders" },
      { path: "products", label: "Products" },
      { path: "request-pricing", label: "Request Pricing" },
      { path: "requests", label: "Requests" },
      { path: "priceconsole", label: "Price Approval" },
      { path: "priceapproval", label: "Price Approval" },
      { path: "pricing/roles", label: "Role Pricing" },
      { path: "pricing/history", label: "Pricing History" },
      { path: "users", label: "User Access" },
    ];

    for (const page of pageMap) {
      if (pathname.includes(page.path)) return page.label;
    }

    return "Dashboard";
  };

  return (
    <header className="h-[80px] bg-[#d1383a] border-b border-[#1C2E4A] flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
      {/* Page Title */}
      <h1 className="text-xl font-semibold text-white">
        {getCurrentPageTitle()}
      </h1>

      {/* Right Controls */}
      <div className="flex items-center gap-6 relative text-white" ref={settingsRef}>
        {/* Admin Settings Dropdown */}
        {role === "admin" && (
          <>
            <button
              onClick={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
              className="hover:text-[#00E0C6] transition"
              title="Settings"
            >
              <FiSettings className="w-5 h-5" />
            </button>

            {settingsDropdownOpen && (
              <div className="absolute right-0 top-12 w-56 bg-white border border-gray-200 rounded-md shadow-md z-50">
                <ul className="text-sm text-[#10223E] py-2 font-medium">
                  <li>
                    <button
                      onClick={() => {
                        navigate("/admin/users");
                        setSettingsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#00E0C610]"
                    >
                      User Access
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        navigate("/admin/pricing/roles");
                        setSettingsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#00E0C610]"
                    >
                      Branding Settings
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        navigate("/admin/pricing/history");
                        setSettingsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#00E0C610]"
                    >
                      Terms & Policies
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </>
        )}

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="flex items-center gap-1 text-sm hover:text-red-500 transition"
          title="Logout"
        >
          <FiLogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </header>
  );
}
