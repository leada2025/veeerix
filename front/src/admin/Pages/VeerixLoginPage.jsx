import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/Axios";
import veerixLogo from "../../assets/v_logo.png";

const VeerixLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/users/admin/login", {
        email,
        password,
      });

      const { user } = res.data;

      localStorage.setItem("user", JSON.stringify(user));
      navigate("/admin/dashboard"); // or your preferred admin route
    } catch (err) {
      console.error(err);
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#f0f9ff]">
      <div className="max-w-md w-full bg-white shadow-md rounded-2xl p-8 space-y-6">
        <div className="flex justify-center">
          <img src={veerixLogo} alt="Veerix Logo" className="h-16" />
        </div>
        <h2 className="text-2xl font-bold text-center text-[#d1383a]">
          Veerix Admin Login
        </h2>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#d1383a]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#d1383a]"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-md font-semibold bg-[#d1383a] text-white hover:bg-[#b52f30] transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default VeerixLoginPage;
