// src/routes/CustomerRoutes.jsx
import React from "react";
import { Route } from "react-router-dom";
import CustomerLayout from "../Components/AppLayout";

import TrademarkRequsetForm from "../Components/TrademarkRequestForm";

import TrademarkTracklinePage from "../Components/TrademarkTracklinePage";
import TrademarkHistory from "../Components/TrademarkHistory";

import PackingHistory from "../Components/PackingHistory";
import CustomerDirectTrademarkPage from "../Components/CustomerDirectTrademarkPage";

import Dashboard from "../pages/Dashboard";
import RequestDetails from "../Components/RequestDetails";
import TrademarkDashboard from "../pages/FbsDashboard";



const CustomerRoutes = () => (
  <Route element={<CustomerLayout />}>
     <Route path="/dashboard" element={<Dashboard />} />
  
    <Route path="/trademark" element={<TrademarkRequsetForm />} />



  
       <Route path="/trademarks/track" element={<TrademarkTracklinePage />} />
       <Route path="/trademarkh/history" element={<TrademarkHistory />} />
     
            <Route path="/packing-history" element={<PackingHistory />} />

      <Route path="/admin/my-registered" element={<CustomerDirectTrademarkPage />} />
    
      <Route path="/requests/:id" element={<RequestDetails />} />
      <Route path="/fbsdashboard" element={<TrademarkDashboard />} />
      

  </Route>
);

export default CustomerRoutes;
