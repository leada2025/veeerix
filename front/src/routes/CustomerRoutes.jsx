// src/routes/CustomerRoutes.jsx
import React from "react";
import { Route } from "react-router-dom";
import CustomerLayout from "../Components/AppLayout";
import CreateBrandForm from "../Components/CreateBrandForm";
import TrademarkDashboard from "../Components/TrademarkRequestForm";
import PlaceOrder from "../Components/PlaceOrder";
import StatusPage from "../Components/StatusPage";
import PackingApprovalPage from "../Components/PackingApproval";
import DistributionPage from "../Components/DistributionPage";

const CustomerRoutes = () => (
  <Route element={<CustomerLayout />}>
    <Route path="/create-brand" element={<CreateBrandForm />} />
    <Route path="/trademark" element={<TrademarkDashboard />} />
    <Route path="/place-order" element={<PlaceOrder />} />
    <Route path="/status" element={<StatusPage />} />
    <Route path="/packing-approval" element={<PackingApprovalPage />} />
    <Route path="/distribution" element={<DistributionPage />} />
  </Route>
);

export default CustomerRoutes;
