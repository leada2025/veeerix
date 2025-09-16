import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/Axios";
import { useSource } from "../Context/SourceContext";
import veerixLogo from "../assets/v_logo.png";
import fishmanLogo from "../assets/FISHMAN BUSINESS SOLUTIONS.jpeg";

const LoginPage = () => {
  const { source } = useSource();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const isFishman = source === "fishman";

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/users/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Navigate based on brand
      navigate(isFishman ? "/trademark" : "/dashboard");
    } catch (err) {
      console.error(err);
      setError("Invalid email or password");
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 ${
        isFishman ? "bg-[#fef3f7]" : "bg-[#f0f9ff]"
      }`}
    >
      <div className="max-w-md w-full bg-white shadow-md rounded-2xl p-8 space-y-6">
        <div className="flex justify-center">
          <img
            src={isFishman ? fishmanLogo : veerixLogo}
            alt="logo"
            className={`h-16 ${isFishman ? "rounded-md" : ""}`}
          />
        </div>
        <h2
          className={`text-2xl font-bold text-center ${
            isFishman ? "text-[#7b4159]" : "text-[#d1383a]"
          }`}
        >
          {isFishman ? "Fishman login" : "Veerix Login"}
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
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
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
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <button
            type="submit"
            className={`w-full py-2 rounded-md font-semibold transition ${
              isFishman
                ? "bg-[#7b4159] text-white hover:bg-[#62364b]"
                : "bg-[#d1383a] text-white hover:bg-[#b52f30]"
            }`}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
