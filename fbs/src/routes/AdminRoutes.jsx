import React from "react";
import { Route } from "react-router-dom";
import VeerixLoginPage from "../admin/Pages/VeerixLoginPage";
import AdminLayout from "../admin/Components/AdminLayout";
import AdminDashboard from "../admin/Pages/AdminDashboard";
import CustomerManagement from "../admin/Pages/CustomerManagement";

import AdminTrademarkPage from "../admin/Pages/AdminTrademarkPage";
import RegisteredHistoryPage from "../admin/Pages/RegisteredHistoryPage";

import FishmanLoginPage from "../admin/Pages/FbsLoginpage";
import TrademarkDashboard from "../admin/Pages/DashboardFbs";

const AdminRoutes = () => (
  <>
    {/* ✅ Show login at /admin */}
    <Route path="/admin" element={<VeerixLoginPage />} />
    <Route path="/fbsadmin" element={<FishmanLoginPage />} />

    {/* ✅ All other admin pages go under /admin/* and use AdminLayout */}
    <Route path="/admin/dashboard" element={<AdminLayout />}>
      <Route index element={<AdminDashboard />} />
    </Route>
      <Route path="/admin/fbsdashboard" element={<AdminLayout />}>
      <Route index element={<TrademarkDashboard />} />
    </Route>

    <Route path="/admin/customer" element={<AdminLayout />}>
      <Route index element={<CustomerManagement />} />
    </Route>

  

    <Route path="/admin/trademark" element={<AdminLayout />}>
      <Route index element={<AdminTrademarkPage />} />
    </Route>

    <Route path="/admin/history" element={<AdminLayout />}>
      <Route index element={<RegisteredHistoryPage />} />
    </Route>

 
  

  

  </>
);

export default AdminRoutes;
