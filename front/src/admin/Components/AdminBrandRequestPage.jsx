import React, { useEffect, useState } from "react";
import axios from "../api/Axios";

const AdminBrandRequestPage = () => {
  const [requests, setRequests] = useState([]);
  const [adminResponses, setAdminResponses] = useState({});
  const [adminInputs, setAdminInputs] = useState({});
  const [popupOpenId, setPopupOpenId] = useState(null);

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
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Comment</th>
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

                <td className="px-4 py-2">
                  <div className="text-sm text-gray-700 mb-1">
                    Actual Rate: ₹ {req.amount ?? "-"}
                  </div>
                  <input
                    type="number"
                    className="border rounded px-2 py-1 w-24 text-sm"
                    placeholder="₹ Quote"
                    value={adminInputs[req._id]?.quotedAmount ?? req.quotedAmount ?? ""}
                    onChange={(e) =>
                      setAdminInputs((prev) => ({
                        ...prev,
                        [req._id]: {
                          ...prev[req._id],
                          quotedAmount: e.target.value,
                        },
                      }))
                    }
                  />
                  <button
                    onClick={async () => {
                      try {
                        const quotedAmount = adminInputs[req._id]?.quotedAmount;
                        if (!quotedAmount) return;

                        await axios.patch(`/api/brand-request/${req._id}/admin`, {
                          quotedAmount,
                        });
                        fetchRequests();
                      } catch (err) {
                        console.error("Save quote failed:", err);
                      }
                    }}
                    className="mt-1 text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                  >
                    Save
                  </button>
                </td>

                <td className="px-4 py-2 relative text-sm text-gray-800 space-y-2">
                  {/* Customer Comment with Popup Trigger */}
                  <div>
                    <span className="font-semibold">Customer:</span>{" "}
                    {req.customerComment ? (
                      <button
                        onClick={() => setPopupOpenId(req._id)}
                        className="text-blue-600 underline"
                      >
                        View Comment
                      </button>
                    ) : (
                      "-"
                    )}
                  </div>

                  {/* Popup for Customer Comment */}
                  {popupOpenId === req._id && (
                    <div className="absolute z-50 bg-white shadow-lg border rounded-lg p-4 w-64 top-10 left-0">
                      <div className="font-bold mb-2">Customer Comment</div>
                      <div className="text-gray-700 whitespace-pre-line max-h-48 overflow-y-auto">
                        {req.customerComment}
                      </div>
                      <button
                        onClick={() => setPopupOpenId(null)}
                        className="mt-2 text-xs text-red-600 underline"
                      >
                        Close
                      </button>
                    </div>
                  )}

                  {/* Admin dropdown to approve/reject */}
                  {req.status === "Pending" && (
                    <div className="pt-1">
                      <select
                        value={adminResponses[req._id]?.status || ""}
                        onChange={async (e) => {
                          const status = e.target.value;
                          const quotedAmount =
                            adminInputs[req._id]?.quotedAmount ?? req.quotedAmount;

                          setAdminResponses((prev) => ({
                            ...prev,
                            [req._id]: { ...(prev[req._id] || {}), status },
                          }));

                          let adminComment = "";
                          if (status === "Approved") {
                            adminComment =
                              "✅ Your request has been approved.";
                          } else if (status === "Rejected") {
                            adminComment =
                              "❌ Your request has been rejected.";
                          }

                          try {
                            await axios.patch(`/api/brand-request/${req._id}/admin`, {
                              quotedAmount,
                              status,
                              adminComment,
                            });
                            fetchRequests();
                          } catch (err) {
                            console.error("Update failed:", err);
                          }
                        }}
                        className="border p-1 rounded w-full text-sm"
                      >
                        <option value="">-- Select --</option>
                        <option value="Approved">✅ Approve</option>
                        <option value="Rejected">❌ Reject</option>
                      </select>
                    </div>
                  )}
                </td>

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
                <td colSpan={8} className="text-center py-6 text-gray-500">
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
