import React, { useEffect, useMemo, useState } from "react";
import axios from "../api/Axios";
import { MessageCircle } from "lucide-react";
const AdminBrandRequestPage = () => {
  const [requests, setRequests] = useState([]);
  const [adminInputs, setAdminInputs] = useState({});
  const [popupOpenId, setPopupOpenId] = useState(null);

  // Pagination (client-side)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get("/api/admin/brand-requests");
      setRequests(res.data || []);
      // Reset to page 1 whenever data changes to avoid empty pages
      setCurrentPage(1);
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

  // Save only the quote
  const handleSaveQuote = async (requestId) => {
    try {
      const quotedAmount =
        adminInputs[requestId]?.quotedAmount ??
        ""; // allow saving if they typed something
      if (quotedAmount === "") {
        alert("Please enter a quote before saving.");
        return;
      }
      await axios.patch(`/api/brand-request/${requestId}/admin`, {
        quotedAmount,
      });
      fetchRequests();
    } catch (err) {
      console.error("Save quote failed:", err);
    }
  };

  // Quick decision from comment column
  const handleQuickDecision = async (req, decision) => {
    try {
      const status = decision === "approve" ? "Approved" : "Rejected";
      const quotedAmount =
        adminInputs[req._id]?.quotedAmount ?? req.quotedAmount ?? undefined;

      let adminComment =
        status === "Approved"
          ? "✅ Your request has been approved."
          : "❌ Your request has been rejected.";

      await axios.patch(`/api/brand-request/${req._id}/admin`, {
        quotedAmount,
        status,
        adminComment,
      });
      fetchRequests();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  // Pagination derived values
  const totalPages = Math.max(1, Math.ceil(requests.length / itemsPerPage));
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return requests.slice(start, start + itemsPerPage);
  }, [requests, currentPage]);

  // Keep currentPage in valid range when list shrinks
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-[#d1383a] mb-6">
        Molecule Requests
      </h2>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-[#d1383a] text-white sticky top-0">
            <tr>
              <th className="px-4 py-3">Molecule</th>
              <th className="px-4 py-3">Custom</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Open Chat</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentItems.map((req) => {
              const inputValue =
                adminInputs[req._id]?.quotedAmount ??
                (req.quotedAmount ?? "");
              const saveDisabled =
                inputValue === "" ||
                String(inputValue) === String(req.quotedAmount ?? "");

              return (
                <tr
                  key={req._id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">{req.moleculeName}</td>
                  <td className="px-4 py-3">{req.customMolecule || "-"}</td>
                  <td className="px-4 py-3">
                    {req.customerId?.name || "N/A"}
                  </td>

                  {/* Amount + Quote */}
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-600 mb-1">
                      Actual Rate: <span className="font-medium">₹ {req.amount ?? "-"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className="border rounded-lg px-2 py-1 w-28 text-sm focus:outline-none focus:ring-2 focus:ring-[#d1383a]/30"
                        placeholder="₹ Quote"
                        value={inputValue}
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
                        onClick={() => handleSaveQuote(req._id)}
                        disabled={saveDisabled}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition
                          ${
                            saveDisabled
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-[#d1383a] text-white hover:bg-[#b52e31]"
                          }`}
                      >
                        Save Quote
                      </button>
                    </div>
                  </td>

              

<td className="px-4 py-3 align-top">
  {req.customerComment || (req.messages && req.messages.length > 0) ? (
    <div className="flex items-center gap-2">
      {/* Chat Icon */}
      <button
        onClick={() => setPopupOpenId(req._id)}
        className="relative flex items-center justify-center w-9 h-9 rounded-full 
                   bg-blue-50 hover:bg-blue-100 shadow-sm transition-colors"
        title="Open Chat"
      >
        <MessageCircle className="w-5 h-5 text-blue-600" />

        {/* 🔴 Red dot if last message is from customer */}
        {req.messages?.length > 0 &&
          req.messages[req.messages.length - 1].sender === "customer" && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
          )}
      </button>

      {/* If plain customer comment exists (no chat started yet) */}
      {req.messages?.length === 0 && req.customerComment && (
        <span className="text-xs text-gray-600 truncate max-w-[120px] italic">
          {req.customerComment}
        </span>
      )}
    </div>
  ) : (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500">
      No comment
    </span>
  )}
</td>


                  {/* Status */}
                  <td className="px-4 py-3 font-medium">{req.status}</td>

                  {/* Payment */}
                  <td className="px-4 py-3">
                    {req.paymentDone ? (
                      <span className="text-green-600 font-semibold">Paid</span>
                    ) : (
                      <span className="text-red-500 font-semibold">
                        Not Paid
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2">
                      {/* If no comment and still Pending, show Approve/Reject here */}
                      {req.status === "Pending" && !req.customerComment && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateStatus(req._id, "Approved")}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500 hover:bg-green-600 text-white"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(req._id, "Rejected")}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500 hover:bg-red-600 text-white"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {req.status === "Approved" && (
                        <button
                          onClick={() =>
                            updateStatus(req._id, "Requested Payment")
                          }
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-yellow-500 hover:bg-yellow-600 text-white"
                        >
                          Request Payment
                        </button>
                      )}

                      {req.status === "Requested Payment" && (
                        <button
                          onClick={() =>
                            updateStatus(req._id, "Paid", true)
                          }
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600 hover:bg-green-700 text-white"
                        >
                          Mark as Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {currentItems.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-500">
                  No molecule requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50"
        >
          Prev
        </button>

        {[...Array(totalPages)].map((_, i) => {
          const pageNum = i + 1;
          const active = pageNum === currentPage;
          return (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`px-3 py-1.5 rounded-lg border text-sm transition
                ${
                  active
                    ? "bg-[#d1383a] text-white border-[#d1383a]"
                    : "bg-white text-[#d1383a] border-[#d1383a] hover:bg-[#d1383a]/10"
                }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() =>
            setCurrentPage((p) => Math.min(totalPages, p + 1))
          }
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Centered modal for full comment */}
      {/* 🆕 Chat Modal */}
{popupOpenId && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl flex flex-col h-[80vh]">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-base font-semibold text-[#d1383a]">Conversation</h3>
        <button
          onClick={() => setPopupOpenId(null)}
          className="text-gray-500 hover:text-gray-800 text-sm"
        >
          ✖
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        {requests.find((r) => r._id === popupOpenId)?.messages?.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg max-w-[70%] ${
              msg.sender === "admin"
                ? "bg-red-100 self-end ml-auto"
                : "bg-gray-100"
            }`}
          >
            <div className="text-sm">{msg.text}</div>
            <div className="text-xs text-gray-500">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={adminInputs[popupOpenId]?.message || ""}
          onChange={(e) =>
            setAdminInputs((prev) => ({
              ...prev,
              [popupOpenId]: {
                ...(prev[popupOpenId] || {}),
                message: e.target.value,
              },
            }))
          }
          className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#d1383a]"
        />
        <button
          className="px-3 py-1 bg-[#d1383a] text-white rounded hover:bg-[#b42f31] transition-colors"
          onClick={async () => {
            const text = adminInputs[popupOpenId]?.message?.trim();
            if (!text) return;
            try {
              await axios.patch(`/api/brand-request/${popupOpenId}/message`, {
                sender: "admin",
                text,
              });
              setAdminInputs((prev) => ({
                ...prev,
                [popupOpenId]: { ...prev[popupOpenId], message: "" },
              }));
              await fetchRequests(); // reload data
            } catch (err) {
              console.error("Send message failed", err);
            }
          }}
        >
          Send
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default AdminBrandRequestPage;
