// src/routes/AdminRoutes.jsx
import React from "react";
import { Route } from "react-router-dom";
import AdminLayout from "../admin/Components/AdminLayout";
import CustomerManagement from "../admin/Pages/CustomerManagement";
import AdminBrandRequestPage from "../admin/Components/AdminBrandRequestPage";
import AdminTrademarkPage from "../admin/Pages/AdminTrademarkPage";
import RegisteredHistoryPage from "../admin/Pages/RegisteredHistoryPage";
import AdminPackingPage from "../admin/Pages/AdminPackingPage";
import AdminAvailableDesignsPage from "../admin/Components/AdminAvailableDesignsPage";
import AdminTracklineUpdate from "../admin/Components/AdminPackingTrackline";
import AdminMoleculePanel from "../admin/Components/AdminMoleculePanel";
import AdminOrderPanel from "../admin/Pages/AdminOrderPanel";
import AdminDashboard from "../admin/Pages/AdminDashboard";


const AdminRoutes = () => (
  <>
    <Route path="/admin" element={<AdminLayout />}>
      <Route path="customer" element={<CustomerManagement />} />
      <Route path="molecule" element={<AdminBrandRequestPage />} />
      <Route path="trademark" element={<AdminTrademarkPage />} />
       <Route path="history" element={<RegisteredHistoryPage />} />
       <Route path="packing" element={<AdminPackingPage/>} />
      <Route path="designs" element={<AdminAvailableDesignsPage/>} />
       <Route path="packingtrack" element={<AdminTracklineUpdate/>} />
        <Route path="addmolecule" element={<AdminMoleculePanel/>} />
        <Route path="orders" element={<AdminOrderPanel/>} />
         <Route path="/" element={<AdminDashboard/>} />
    </Route>
  </>
);

export default AdminRoutes;
