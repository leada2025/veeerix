import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiSettings, FiLogOut } from "react-icons/fi";
import { useSource } from "../../Context/SourceContext"; // ✅ use source context

export default function AdminNavbar() {
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const [role, setRole] = useState(null);
  const settingsRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { source } = useSource(); // ✅ get source (veerix / fishman)

  // role from localStorage
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole?.toLowerCase() || null);
  }, []);

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setSettingsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // dynamic title mapping
const getCurrentPageTitle = () => {
  const pathname = location.pathname.toLowerCase();
  const pageMap = [
    { path: "/admin/packingtrack", label: "Packing Status" },
    { path: "/admin/designs", label: "Packing Designs" },
    { path: "/admin/packing", label: "Packing Approval" },
    { path: "/admin/customer", label: "Customers" },
    { path: "/admin/orders", label: "Order Management" },
    { path: "/admin/molecule", label: "Brand Requests" },
    { path: "/admin/trademark", label: "Trademark" },
    { path: "/admin/history", label: "Trademark History" },
    { path: "/admin/addmolecule", label: "Add Molecule" },
    { path: "/admin/pricing/history", label: "Pricing History" },
    { path: "/admin/users", label: "User Access" },
  ];

  for (const page of pageMap) {
    if (pathname.startsWith(page.path)) return page.label;
  }
  return "Dashboard";
};


  // logout per source
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("source");

    // ✅ Redirect to correct landing
    if (source === "fishman") {
      navigate("/");
    } else {
      navigate("/"); // veerix landing
    }
  };

  return (
    <header
      className={`h-[80px] border-b flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm
        ${source === "fishman" ? "bg-[#7b4159] border-[#7b4159]" : "bg-[#d1383a] border-[#1C2E4A]"}
      `}
    >
      {/* Page Title */}
      <h1 className="text-xl font-semibold text-white">{getCurrentPageTitle()}</h1>

      {/* Right Controls */}
      <div
        className="flex items-center gap-6 relative text-white"
        ref={settingsRef}
      >
        {/* Admin Settings Dropdown */}
        {role === "admin" && (
          <>
            <button
              onClick={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
              className="hover:text-yellow-300 transition"
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
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
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
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
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
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
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
          onClick={handleLogout}
          className="flex items-center gap-1 text-sm hover:text-red-400 transition"
          title="Logout"
        >
          <FiLogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </header>
  );
}
