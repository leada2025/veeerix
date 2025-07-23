// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import VeerixOrdersLanding from "./Components/VeerixOrdersLanding";
import LoginPage from "./pages/LoginPage";
import CustomerRoutes from "./routes/CustomerRoutes";
import AdminRoutes from "./routes/AdminRoutes";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<VeerixOrdersLanding />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Split private routes */}
      {CustomerRoutes()}
      {AdminRoutes()}
    </Routes>
  );
}

export default App;
