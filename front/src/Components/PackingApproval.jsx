import React, { useEffect, useState } from "react";
import axios from "../api/Axios";

const CustomerPackingPage = () => {
 const [designs, setDesigns] = useState([]);


  const [selectedDesign, setSelectedDesign] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [finalDesign, setFinalDesign] = useState(null);
  const [rejectedReason, setRejectedReason] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [status, setStatus] = useState("Pending");
  const [step, setStep] = useState(0);
 const [history, setHistory] = useState([]);



  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://veeerix.onrender.com";

  // ✅ Safe localStorage access
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
        image: `${BASE_URL}${design.imageUrl}`, // full URL for image
      }));
      setDesigns(mapped);
    } catch (err) {
      console.error("Failed to load available designs:", err);
    }
  };

  fetchAvailableDesigns();
}, []);


useEffect(() => {
  if (!customerId || designs.length === 0) return;

 const fetchStatus = async () => {
  try {
    const res = await axios.get(`/packing/${customerId}`);
    const data = res.data;

    setSubmitted(data.submitted);
    setStatus(data.status);
    setStep(data.trackingStep || 0);

    // Handle final design URL
    if (data.finalDesignUrl) {
      setFinalDesign(data.finalDesignUrl);
    } else {
      setFinalDesign(null);
    }

    // If completed cycle, reset everything
    if (data.cycleStatus === "completed") {
      setSelectedDesign(null);
      setFinalDesign(null);
      setStatus("Pending");
      setStep(0);
      setSubmitted(false);
    }
  } catch (err) {
    console.error("Failed to load design status:", err);
  }
};


  fetchStatus();
}, [customerId, designs]); // ✅ add 'designs' here


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
;



  const handleSubmit = async () => {
    if (!selectedDesign || !customerId) return;

    try {
      const res = await axios.post("/packing/submit", {
        customerId,
        selectedDesignId: selectedDesign.id,
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const handleApprove = async () => {
    try {
      await axios.post("/packing/approve", { customerId });
      setStatus("Approved");
    } catch (err) {
      console.error("Approve failed:", err);
    }
  };

  const handleReject = async () => {
    if (!rejectedReason.trim()) return;
    try {
      await axios.post("/packing/reject", {
        customerId,
        reason: rejectedReason,
      });
      setStatus("Rejected");
      setShowRejectBox(false);
    } catch (err) {
      console.error("Reject failed:", err);
    }
  };

  const statuses = [
    "Customer Approved",
    "QC Approved",
    "Sent for Printing",
    "In Progress",
    "Dispatched to Factory",
  ];

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-6 text-[#d1383a]">Select Packing Texture Design</h2>

      {/* Design Selection */}
      {!submitted && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {designs.map((design) => (
            <div
              key={design.id}
              onClick={() => !submitted && setSelectedDesign(design)}
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
      )}

      {/* Selected Preview */}
      {!submitted && selectedDesign && (
        <div className="mt-4 mb-4">
          <p className="text-sm font-medium">Selected: {selectedDesign.label}</p>
          <img src={selectedDesign.image} className="w-full max-w-sm mt-2 rounded" />
        </div>
      )}

      {/* Submit Button */}
      {!submitted && selectedDesign && (
        <div className="text-right">
          <button
            className="bg-[#d1383a] text-white px-6 py-2 rounded"
            onClick={handleSubmit}
          >
            Submit for Finalization
          </button>
        </div>
      )}

      {/* Final Design Preview */}
      {submitted && status === "Sent for Customer Approval" && finalDesign && (
        <div className="mt-8">
          <h3 className="font-semibold mb-2">Final Design</h3>
        <img
  src={
    finalDesign.startsWith("http")
      ? finalDesign
      : `${BASE_URL}/${finalDesign.replace(/^\/?uploads\/?/, "uploads/")}`
  }
  alt="Final Design"
  className="w-full max-w-md rounded shadow"
/>


          <div className="flex gap-4 mt-4">
            <button
              className="bg-[#d1383a] text-white px-4 py-2 rounded"
              onClick={handleApprove}
            >
              Approve
            </button>
            <button
              className="bg-gray-300 text-[#d1383a] px-4 py-2 rounded"
              onClick={() => setShowRejectBox(true)}
            >
              Reject
            </button>
          </div>

          {showRejectBox && (
            <div className="mt-4">
              <textarea
                rows={4}
                placeholder="Reason for rejection..."
                className="w-full border px-3 py-2 rounded"
                value={rejectedReason}
                onChange={(e) => setRejectedReason(e.target.value)}
              />
              <button
                className="mt-2 bg-[#d1383a] text-white px-4 py-2 rounded"
                onClick={handleReject}
              >
                Submit Rejection
              </button>
            </div>
          )}
        </div>
      )}

      {/* Show waiting message if submitted but final not uploaded */}
      {submitted && !finalDesign && (
        <p className="text-gray-600 mt-4">
          Your design has been submitted. Awaiting final design from admin...
        </p>
      )}

      {/* Tracking Status */}
      {status === "Approved" && (
        <div className="mt-10">
          <h3 className="text-md font-semibold mb-4">Packing Progress</h3>
          <div className="flex items-center justify-between relative">
            {statuses.map((label, index) => (
              <div key={index} className="flex-1 text-center z-10">
                <div
                  className={`w-5 h-5 mx-auto rounded-full ${
                    index <= step ? "bg-[#d1383a]" : "bg-gray-300"
                  }`}
                />
                <p
                  className={`text-xs mt-2 ${
                    index <= step ? "text-[#d1383a]" : "text-gray-400"
                  }`}
                >
                  {label}
                </p>
              </div>
            ))}
            <div className="absolute top-2 left-2 right-2 h-1 bg-gray-200 z-0" />
            <div
              className="absolute top-2 left-2 h-1 bg-[#d1383a] z-10"
              style={{ width: `${(step / (statuses.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      )}
      {history.length > 0 && (
  <div className="mt-10">
    <h3 className="text-md font-semibold mb-4">Previous Packing Design History</h3>
    <div className="space-y-4">
      {history.map((entry, idx) => (
        <div key={entry._id} className="p-4 border rounded bg-gray-50">
          <p><strong>Design:</strong> {entry.selectedDesignId?.label || "N/A"}</p>
          <p><strong>Status:</strong> {entry.status}</p>
          <p><strong>Submitted:</strong> {new Date(entry.createdAt).toLocaleString()}</p>
          {entry.finalDesignUrl && (
            <img
              src={`${BASE_URL}/${entry.finalDesignUrl.replace(/^\/?uploads\/?/, "uploads/")}`}
              alt="Final Design"
              className="w-40 mt-2 rounded"
            />
          )}
        </div>
      ))}
    </div>
  </div>
)}


    </div>
  );
};

export default CustomerPackingPage;
