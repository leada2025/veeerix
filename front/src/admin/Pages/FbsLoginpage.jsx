import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/Axios";
import fishmanLogo from "../../assets/FISHMAN BUSINESS SOLUTIONS.jpeg"; // 🔹 Fishman logo
import { useSource } from "../../Context/SourceContext";

const FishmanLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setSource } = useSource();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/users/fbsadmin/login", {
        email,
        password,
      });

      const { user } = res.data;
      localStorage.setItem("fbsUser", JSON.stringify(user));
      setSource("fishman"); // ✅ tell context we are in Fishman

      navigate("/admin/fbsdashboard");
    } catch (err) {
      console.error(err);
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="max-w-md w-full bg-[#7b4159] shadow-md rounded-2xl p-8 space-y-6">
        <div className="flex justify-center">
          <img src={fishmanLogo} alt="Fishman Logo" className="h-16 rounded" />
        </div>
        <h2 className="text-2xl font-bold text-center text-white">
          Fishman Admin Login
        </h2>

        {error && <p className="text-red-300 text-sm text-center">{error}</p>}

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-white">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-white rounded-md shadow-sm bg-transparent text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="Enter email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-white rounded-md shadow-sm bg-transparent text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="Enter password"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-md font-semibold bg-white text-[#7b4159] hover:bg-gray-100 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default FishmanLoginPage;
