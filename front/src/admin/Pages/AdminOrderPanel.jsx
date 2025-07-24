import React, { useEffect, useState } from "react";
import axios from "../api/Axios";

const orderSteps = [
  "Brand Name Submitted", "Payment Confirmed", "Packing Design", "Raw Material", "Under Production",
  "Under Packing", "Under Testing", "Dispatched", "In Transit",
  "Received at Distribution Centre", "Delivered to Client"
];

const AdminOrderPanel = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await axios.get("/orders/admin/all");
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStep = async (orderId, step) => {
    try {
      await axios.patch(`/orders/admin/${orderId}/step`, { trackingStep: step });
      fetchOrders(); // refresh
    } catch (err) {
      alert("Update failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h2 className="text-3xl font-semibold text-[#d1383a] mb-6 border-b pb-2">🧾 Admin Order Panel</h2>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="overflow-auto rounded-lg shadow border border-gray-200">
          <table className="min-w-full text-sm text-left text-gray-800">
            <thead className="bg-[#d1383a] text-white">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Molecule</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Current Step</th>
                <th className="px-4 py-3">Update Step</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-xs font-mono text-gray-600">{order.customerId.name}</td>
                  <td className="px-4 py-3 font-semibold">{order.brandName}</td>
                  <td className="px-4 py-3">{order.moleculeName}</td>
                  <td className="px-4 py-3">{order.quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{orderSteps[order.trackingStep] || "Not Started"}</td>
                  <td className="px-4 py-3">
                    <select
                      value={order.trackingStep}
                      onChange={(e) => updateStep(order._id, parseInt(e.target.value))}
                      className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-[#d1383a] focus:border-[#d1383a] outline-none"
                    >
                      {orderSteps.map((step, index) => (
                        <option key={index} value={index}>
                          {step}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrderPanel;
