import React, { useEffect, useState } from "react";
import axios from "../api/Axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../api/config";

const CustomerPackingPage = () => {
  const [designs, setDesigns] = useState([]);
  const [selectedDesigns, setSelectedDesigns] = useState([]);
  const [history, setHistory] = useState([]);
const [hasPending, setHasPending] = useState(false);

  const navigate = useNavigate();
  const normalizeUrl = (url) => (url.startsWith("/") ? url : `/${url}`);

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
      const pendingExists = res.data.some((entry) => entry.status === "Pending");
      setHasPending(pendingExists);
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  };
  fetchHistory();
}, [customerId]);


  const toggleDesignSelection = (design) => {
    if (selectedDesigns.some((d) => d.id === design.id)) {
      setSelectedDesigns(selectedDesigns.filter((d) => d.id !== design.id));
    } else if (selectedDesigns.length < 3) {
      setSelectedDesigns([...selectedDesigns, design]);
    }
  };

  const handleSubmit = async () => {
    if (selectedDesigns.length < 2 || !customerId) return;
    try {
      const selectedIds = selectedDesigns.map((d) => d.id);
      await axios.post("/packing/submit", {
        customerId,
        selectedDesignIds: selectedIds,
      });
      setSelectedDesigns([]);
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
      console.error("Reject failed:", err.response?.data || err.message);
    }
  };

  const handleSelectFinalDesign = async (entryId, selectedDesignId) => {
    try {
      await axios.post(`/packing/approve-edited`, {
        designId: entryId,
        selectedDesignId,
      });
      const res = await axios.get(`/packing/history/${customerId}`);
      setHistory(res.data);
    } catch (err) {
      console.error("Selection failed:", err);
    }
  };
const handleCancelSubmission = async (entryId) => {
  try {
    await axios.post("/packing/cancel", { designId: entryId });
    const res = await axios.get(`/packing/history/${customerId}`);
    setHistory(res.data);
  } catch (err) {
    console.error("Cancel failed:", err.response?.data || err.message);
  }
};

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white shadow rounded">
     <h2 className="text-xl font-bold mb-6 text-[#d1383a]">
  Select 2–3 Packing Texture Designs
</h2>

<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
  {designs.map((design) => {
    const isSelected = selectedDesigns.some((d) => d.id === design.id);
    const selectionLimitReached =
      selectedDesigns.length >= 3 && !isSelected;

    return (
      <div
        key={design.id}
        onClick={() => {
          if (!selectionLimitReached) toggleDesignSelection(design);
        }}
        className={`cursor-pointer border rounded p-2 text-center transition-all duration-200 ${
          isSelected
            ? "border-[#d1383a] ring-2 ring-[#d1383a]"
            : "border-gray-300 hover:border-[#999]"
        } ${selectionLimitReached ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <img
          src={design.image}
          className="w-full h-40 object-cover rounded"
          alt={design.label}
        />
        <div className="mt-2 font-medium">{design.label}</div>
      </div>
    );
  })}
</div>

{selectedDesigns.length > 0 && (
  <div className="mt-4 mb-4">
    <p className="text-sm font-medium mb-2 text-gray-700">
      Selected: {selectedDesigns.map((d) => d.label).join(", ")}
    </p>

    <div className="flex gap-4 mt-2 flex-wrap">
      {selectedDesigns.map((design) => (
        <img
          key={design.id}
          src={design.image}
          className="w-32 h-32 object-cover rounded"
          alt={design.label}
        />
      ))}
    </div>

    <div className="text-right mt-4 flex justify-end gap-4">
  
      <button
        className={`px-6 py-2 rounded text-white ${
          selectedDesigns.length >= 2 && selectedDesigns.length <= 3
            ? "bg-[#d1383a] hover:bg-[#b8302d]"
            : "bg-gray-400 cursor-not-allowed"
        }`}
        disabled={selectedDesigns.length < 2}
        onClick={handleSubmit}
      >
        Submit for Editing
        
      </button>
    </div>
  </div>
)}

      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-4 text-[#d1383a]">
          Your Submission History
        </h3>
        {history.length === 0 ? (
          <p className="text-gray-600">No submissions yet.</p>
        ) : (
          <div className="space-y-6">
            {history.map((entry) => (
              <div
                key={entry._id}
                className="border rounded p-4 shadow bg-gray-50"
              >
                <p className="font-medium mb-1">Status: {entry.status}</p>
                <p className="text-sm text-gray-500">
                  Submitted: {new Date(entry.createdAt).toLocaleString()}
                </p>
{entry.status === "Pending" && (
  <p className="text-sm text-blue-600 mt-1">
    Waiting for admin to review your selections...
  </p>
)}


                {entry.selectedDesignIds?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium">
                      Your Selected Designs
                    </p>
                    <div className="flex gap-4 mt-1">
                      {entry.selectedDesignIds.map((design, idx) => (
                        <img
                          key={idx}
                          src={`${BASE_URL}${design.imageUrl}`}
                          className="w-40 rounded"
                          alt="Selected"
                        />
                      ))}
                    </div>
                  </div>
                )}
                {entry.status === "Pending" && (
  <div className="mt-4">
    <button
      onClick={() => handleCancelSubmission(entry._id)}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
    >
      Cancel This Submission
    </button>
    <p className="text-sm text-gray-500 mt-1">You can reselect designs after cancellation.</p>
  </div>
)}


            {/* 1. Show options if NOT yet selected */}
{entry.adminEditedDesigns?.length > 0 &&
  entry.status === "Sent for Customer Approval" &&
  !entry.selectedFinalDesign && (
    <div className="mt-4 border-l-4 border-yellow-500 pl-4 bg-yellow-50 p-2 rounded">
      <p className="text-sm font-medium text-yellow-800">
        Admin has sent back {entry.adminEditedDesigns.length} edited design(s).
      </p>
      <p className="text-sm mt-1 text-gray-700">
        Please select your preferred version below.
      </p>

      <div className="flex gap-4 mt-2">
        {entry.adminEditedDesigns.map((edit, idx) => {
          const isSelected = entry.selectedFinalDesign === edit.url;
          return (
            <div key={idx} className="flex flex-col items-center">
        <div className="relative group">
  <img
    src={`${BASE_URL}${normalizeUrl(edit.url)}`}
    className={`w-full h-24 object-cover rounded cursor-pointer transition-all ${
      isSelected
        ? "ring-2 ring-[#d1383a]"
        : "hover:ring-2 hover:ring-gray-400"
    }`}
    onClick={() => handleSelectFinalDesign(entry._id, edit.url)}
    alt={`Edited ${idx + 1}`}
  />
  <a
    href={`${BASE_URL}${normalizeUrl(edit.url)}`}
    download
    className="text-xs text-blue-600 underline mt-1 block text-center"
  >
    Download
  </a>
</div>

              {isSelected && (
                <span className="text-xs text-[#d1383a] mt-1 font-semibold">
                  Selected
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  )}

{/* 2. Show selected version preview only */}
{entry.selectedFinalDesign && (
  <div className="mt-4">
       <p className="text-sm font-medium text-green-700">
          Your Selected Edited Design
        </p>
    {entry.status !== "Approved" && (
      <>
     
        <p className="text-sm text-green-700 mt-1">
          You've selected your preferred version. Waiting for final artwork from admin.
        </p>
      </>
    )}

   <div className="mt-2 flex flex-col items-start gap-2">
  <img
    src={`${BASE_URL}${normalizeUrl(entry.selectedFinalDesign)}`}
    alt="Final Selection"
    className="w-32 h-32 object-cover rounded border border-[#d1383a]"
  />
  <a
    href={`${BASE_URL}${normalizeUrl(entry.selectedFinalDesign)}`}
    download
    className="text-sm text-blue-600 underline"
  >
    Download Selected Design
  </a>
</div>

  </div>
)}



             {entry.finalArtworkUrl && (
  <>
    {/* 🔔 Add this line here */}
 {entry.status !== "Approved" && (
      <>
     
           <p className="text-sm text-purple-700 mb-1">
      Final artwork is ready! Please preview and approve.
    </p>
      </>
    )}

    <div className="mt-4">
      <p className="text-sm font-medium">Final Artwork</p>
      {entry.finalArtworkType === "pdf" ? (
        <a
          href={`${BASE_URL}/${entry.finalArtworkUrl}`}
          className="text-blue-600 underline"
          download
        >
          Download PDF
        </a>
      ) : (
        <img
          src={`${BASE_URL}/${entry.finalArtworkUrl}`}
          className="w-32 mt-1 rounded"
          alt="Final"
        />
      )}
    </div>
  </>
)}

{entry.status === "Sent for Customer Approval" &&
  entry.finalArtworkUrl && (
    <div className="mt-4 space-y-2">
      <a
        href={`${BASE_URL}/${entry.finalArtworkUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-blue-600 underline"
      >
        View Final Artwork
      </a>
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
        <RejectBox
          entryId={entry._id}
          onReject={handleReject}
        />
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
