// src/routes/CustomerRoutes.jsx
import React from "react";
import { Route } from "react-router-dom";
import CustomerLayout from "../Components/AppLayout";
import CreateBrandForm from "../Components/CreateBrandForm";
import TrademarkRequsetForm from "../Components/TrademarkRequestForm";
import PlaceOrder from "../Components/PlaceOrder";
import StatusPage from "../Components/StatusPage";
import PackingApprovalPage from "../Components/PackingApproval";
import DistributionPage from "../Components/DistributionPage";
import TrademarkTracklinePage from "../Components/TrademarkTracklinePage";
import TrademarkHistory from "../Components/TrademarkHistory";
import PackingStatusPage from "../Components/PackingStatusPage";
import PackingHistory from "../Components/PackingHistory";
import CustomerDirectTrademarkPage from "../Components/CustomerDirectTrademarkPage";
import StatusTracker from "../pages/AdminPackingMaterialTracking";
import Dashboard from "../pages/Dashboard";
import RequestDetails from "../Components/RequestDetails";
import TrademarkDashboard from "../pages/FbsDashboard";
import AddMoleculeTrademark from "../Components/Settings";




const CustomerRoutes = () => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const customerId = storedUser?.id;

 

  return (
    <Route element={<CustomerLayout />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/create-brand" element={<CreateBrandForm />} />
      <Route path="/trademark" element={<TrademarkRequsetForm />} />
      <Route path="/place-order" element={<PlaceOrder />} />
      <Route path="/status" element={<StatusPage />} />
      <Route path="/packing-approval" element={<PackingApprovalPage />} />
      <Route path="/distribution" element={<DistributionPage />} />
      <Route path="/trademarks/track" element={<TrademarkTracklinePage />} />
      <Route path="/trademarkh/history" element={<TrademarkHistory />} />
      <Route path="/packing/status" element={<PackingStatusPage />} />
      <Route path="/packing-history" element={<PackingHistory />} />
      <Route path="/admin/my-registered" element={<CustomerDirectTrademarkPage />} />
      <Route path="/packmattrack" element={<StatusTracker />} />
      <Route path="/requests/:id" element={<RequestDetails />} />
      <Route path="/fbsdashboard" element={<TrademarkDashboard />} />
      <Route path="/settings" element={<AddMoleculeTrademark />} />
    </Route>
  );
};


export default CustomerRoutes;
