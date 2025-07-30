import React from "react";
import { Route } from "react-router-dom";
import VeerixLoginPage from "../admin/Pages/VeerixLoginPage";
import AdminLayout from "../admin/Components/AdminLayout";
import AdminDashboard from "../admin/Pages/AdminDashboard";
import CustomerManagement from "../admin/Pages/CustomerManagement";
import AdminBrandRequestPage from "../admin/Components/AdminBrandRequestPage";
import AdminTrademarkPage from "../admin/Pages/AdminTrademarkPage";
import RegisteredHistoryPage from "../admin/Pages/RegisteredHistoryPage";
import AdminPackingPage from "../admin/Pages/AdminPackingPage";
import AdminAvailableDesignsPage from "../admin/Components/AdminAvailableDesignsPage";
import AdminTracklineUpdate from "../admin/Components/AdminPackingTrackline";
import AdminMoleculePanel from "../admin/Components/AdminMoleculePanel";
import AdminOrderPanel from "../admin/Pages/AdminOrderPanel";

const AdminRoutes = () => (
  <>
    {/* ✅ Show login at /admin */}
    <Route path="/admin" element={<VeerixLoginPage />} />

    {/* ✅ All other admin pages go under /admin/* and use AdminLayout */}
    <Route path="/admin/dashboard" element={<AdminLayout />}>
      <Route index element={<AdminDashboard />} />
    </Route>

    <Route path="/admin/customer" element={<AdminLayout />}>
      <Route index element={<CustomerManagement />} />
    </Route>

    <Route path="/admin/molecule" element={<AdminLayout />}>
      <Route index element={<AdminBrandRequestPage />} />
    </Route>

    <Route path="/admin/trademark" element={<AdminLayout />}>
      <Route index element={<AdminTrademarkPage />} />
    </Route>

    <Route path="/admin/history" element={<AdminLayout />}>
      <Route index element={<RegisteredHistoryPage />} />
    </Route>

    <Route path="/admin/packing" element={<AdminLayout />}>
      <Route index element={<AdminPackingPage />} />
    </Route>

    <Route path="/admin/designs" element={<AdminLayout />}>
      <Route index element={<AdminAvailableDesignsPage />} />
    </Route>

    <Route path="/admin/packingtrack" element={<AdminLayout />}>
      <Route index element={<AdminTracklineUpdate />} />
    </Route>

    <Route path="/admin/addmolecule" element={<AdminLayout />}>
      <Route index element={<AdminMoleculePanel />} />
    </Route>

    <Route path="/admin/orders" element={<AdminLayout />}>
      <Route index element={<AdminOrderPanel />} />
    </Route>
  </>
);

export default AdminRoutes;
