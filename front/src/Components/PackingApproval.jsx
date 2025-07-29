import React, { useEffect, useState } from "react";
import axios from "../api/Axios";
import { useNavigate } from "react-router-dom";

const CustomerPackingPage = () => {
  const [designs, setDesigns] = useState([]);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [history, setHistory] = useState([]);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://veeerix.onrender.com";
  const navigate = useNavigate();

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {}
  const customerId = user?.id;

  useEffect(() => {
    const fetchAvailableDesigns = async () => {
      try {
        const res = await axios.get("/packing/designs");
        const mapped = res.data.map((design) => ({
          id: design._id,
          label: design.label || "Untitled Design",
          image: `${BASE_URL}${design.imageUrl}`,
        }));
        setDesigns(mapped);
      } catch (err) {
        console.error("Failed to load available designs:", err);
      }
    };

    fetchAvailableDesigns();
  }, []);

  useEffect(() => {
    if (!customerId) return;
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`/packing/history/${customerId}`);
        setHistory(res.data);
      } catch (err) {
        console.error("Failed to load history:", err);
      }
    };
    fetchHistory();
  }, [customerId]);

  const handleSubmit = async () => {
    if (!selectedDesign || !customerId) return;
    try {
      await axios.post("/packing/submit", {
        customerId,
        selectedDesignId: selectedDesign.id,
      });
      setSelectedDesign(null);
      const res = await axios.get(`/packing/history/${customerId}`);
      setHistory(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const handleApprove = async (entryId) => {
    try {
      await axios.post("/packing/approve", { designId: entryId });
      const res = await axios.get(`/packing/history/${customerId}`);
      setHistory(res.data);
    } catch (err) {
      console.error("Approve failed:", err);
    }
  };

  const handleReject = async (entryId, reason) => {
    if (!reason.trim()) return;
    try {
      await axios.post("/packing/reject", {
        designId: entryId,
        reason,
      });
      const res = await axios.get(`/packing/history/${customerId}`);
      setHistory(res.data);
    } catch (err) {
      console.error("Reject failed:", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-6 text-[#d1383a]">Select Packing Texture Design</h2>

      {/* Design Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {designs.map((design) => (
          <div
            key={design.id}
            onClick={() => setSelectedDesign(design)}
            className={`cursor-pointer border rounded p-2 text-center ${
              selectedDesign?.id === design.id
                ? "border-[#d1383a] ring-2 ring-[#d1383a]"
                : "border-gray-300"
            }`}
          >
            <img src={design.image} className="w-full h-40 object-cover rounded" />
            <div className="mt-2 font-medium">{design.label}</div>
          </div>
        ))}
      </div>

      {/* Selected Preview */}
      {selectedDesign && (
        <div className="mt-4 mb-4">
          <p className="text-sm font-medium">Selected: {selectedDesign.label}</p>
          <img src={selectedDesign.image} className="w-full max-w-sm mt-2 rounded" />
          <div className="text-right mt-4">
            <button
              className="bg-[#d1383a] text-white px-6 py-2 rounded"
              onClick={handleSubmit}
            >
              Submit for Finalization
            </button>
          </div>
        </div>
      )}

      {/* History Section */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-4 text-[#d1383a]">Your Submission History</h3>
        {history.length === 0 ? (
          <p className="text-gray-600">No submissions yet.</p>
        ) : (
          <div className="space-y-6">
            {history.map((entry) => (
              <div key={entry._id} className="border rounded p-4 shadow bg-gray-50">
                <p className="font-medium mb-1">
                  Status:{" "}
                  {entry.status === "Rejected" ? (
                    <span className="text-red-600">Pending (rejected previously)</span>
                  ) : (
                    entry.status
                  )}
                </p>
                <p className="text-sm text-gray-500">
                  Submitted: {new Date(entry.createdAt).toLocaleString()}
                </p>

                {entry.selectedDesignId?.imageUrl && (
                  <div className="mt-3">
                    <p className="text-sm font-medium">Your Design</p>
                    <img
                      src={`${BASE_URL}${entry.selectedDesignId.imageUrl}`}
                      className="w-40 rounded mt-1"
                    />
                  </div>
                )}

                {entry.finalDesignUrl && (
                  <div className="mt-4">
                    <p className="text-sm font-medium">Final Design</p>
                    <img
                      src={`${BASE_URL}/${entry.finalDesignUrl.replace(/^\/?uploads\/?/, "uploads/")}`}
                      className="w-40 rounded mt-1"
                    />
                  </div>
                )}

                {/* Approve/Reject section */}
                {entry.status === "Sent for Customer Approval" && entry.finalDesignUrl && (
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => handleApprove(entry._id)}
                      className="bg-[#d1383a] text-white px-4 py-2 rounded mr-2"
                    >
                      Approve
                    </button>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-gray-700 underline">
                        Reject
                      </summary>
                      <RejectBox entryId={entry._id} onReject={handleReject} />
                    </details>
                  </div>
                )}

                {entry.status === "Approved" && (
                  <div className="mt-3">
                    <button
                      className="text-[#d1383a] underline text-sm"
                      onClick={() => navigate("/packing/status")}
                    >
                      Track Progress →
                    </button>
                  </div>
                )}

             {entry.status === "Pending" && entry.rejectionReason && (
  <p className="mt-2 text-sm text-red-600">
    Rejected previously: {entry.rejectionReason}
  </p>
)}

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const RejectBox = ({ entryId, onReject }) => {
  const [reason, setReason] = useState("");

  return (
    <div className="mt-2">
      <textarea
        rows={3}
        placeholder="Reason for rejection..."
        className="w-full border px-3 py-2 rounded text-sm"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <button
        className="mt-2 bg-gray-700 text-white px-4 py-1 rounded"
        onClick={() => onReject(entryId, reason)}
      >
        Submit Rejection
      </button>
    </div>
  );
};

export default CustomerPackingPage;
