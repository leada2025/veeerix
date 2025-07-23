import React, { useEffect, useState } from "react";
import axios from "../api/Axios"; // your axios instance

const AdminBrandRequestPage = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get("/api/admin/brand-requests");
      setRequests(res.data);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const updateStatus = async (id, status, paymentDone = false) => {
    try {
      await axios.patch(`/api/brand-request/${id}`, { status, paymentDone });
      fetchRequests();
    } catch (error) {
      console.error("Status update failed", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-[#d1383a] mb-6">Molecule Requests</h2>
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-[#d1383a] text-white">
            <tr>
              <th className="px-4 py-3">Molecule</th>
              <th className="px-4 py-3">Custom</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr
                key={req._id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-2">{req.moleculeName}</td>
                <td className="px-4 py-2">{req.customMolecule || "-"}</td>
                <td className="px-4 py-2">{req.customerId?.name || "N/A"}</td>
                <td className="px-4 py-2 font-medium">{req.status}</td>
                <td className="px-4 py-2">
                  {req.paymentDone ? (
                    <span className="text-green-600 font-semibold">✅ Paid</span>
                  ) : (
                    <span className="text-red-500 font-semibold">❌ Not Paid</span>
                  )}
                </td>
                <td className="px-4 py-2 space-x-2">
                  {req.status === "Pending" && (
                    <button
                      onClick={() => updateStatus(req._id, "Approved")}
                      className="bg-[#d1383a] hover:bg-[#b73031] text-white px-3 py-1 rounded"
                    >
                      Approve
                    </button>
                  )}
                  {req.status === "Approved" && (
                    <button
                      onClick={() => updateStatus(req._id, "Requested Payment")}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                    >
                      Request Payment
                    </button>
                  )}
                  {req.status === "Requested Payment" && (
                    <button
                      onClick={() => updateStatus(req._id, "Paid", true)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                    >
                      Mark as Paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  No molecule requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBrandRequestPage;
