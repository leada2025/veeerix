import React, { useEffect, useState } from "react";
import axios from "../api/Axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../api/config";

const CustomerPackingPage = () => {
  const [designs, setDesigns] = useState([]);
  const [selectedDesigns, setSelectedDesigns] = useState([]);
  const [history, setHistory] = useState([]);
  const [hasPending, setHasPending] = useState(false);
  const [activeTab, setActiveTab] = useState("select"); // select | status | history

  const navigate = useNavigate();
  const normalizeUrl = (url) => (url.startsWith("/") ? url : `/${url}`);

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {}
  const customerId = user?.id;

  // Fetch available designs
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

  // Fetch history
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

  // Handlers
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
      setActiveTab("status"); // Move to status after submission
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
      await axios.post("/packing/reject", { designId: entryId, reason });
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

  // ================= RENDER =================
  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white shadow rounded">
      {/* Tabs */}
      <div className="flex gap-6  mb-6">
        <button
          className={`pb-2 ${activeTab === "select" ? "border-b-2 border-[#d1383a] font-semibold text-[#d1383a]" : "text-gray-600"}`}
          onClick={() => setActiveTab("select")}
        >
          Select Design
        </button>
        <button
          className={`pb-2 ${activeTab === "status" ? "border-b-2 border-[#d1383a] font-semibold text-[#d1383a]" : "text-gray-600"}`}
          onClick={() => setActiveTab("status")}
        >
          Design Status
        </button>
        <button
          className={`pb-2 ${activeTab === "history" ? "border-b-2 border-[#d1383a] font-semibold text-[#d1383a]" : "text-gray-600"}`}
          onClick={() => setActiveTab("history")}
        >
          History
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "select" && (
        <SelectDesignTab
          designs={designs}
          selectedDesigns={selectedDesigns}
          toggleDesignSelection={toggleDesignSelection}
          handleSubmit={handleSubmit}
        />
      )}

      {activeTab === "status" && (
        <DesignStatusTab
          history={history}
          normalizeUrl={normalizeUrl}
          handleCancelSubmission={handleCancelSubmission}
          handleSelectFinalDesign={handleSelectFinalDesign}
          handleApprove={handleApprove}
          handleReject={handleReject}
          navigate={navigate}
        />
      )}

      {activeTab === "history" && (
        <HistoryTab history={history} BASE_URL={BASE_URL} />
      )}
    </div>
  );
};

/* -------------------- TABS -------------------- */
const SelectDesignTab = ({ designs, selectedDesigns, toggleDesignSelection, handleSubmit }) => (
  <div>
    <h2 className="text-xl font-bold mb-6 text-[#d1383a]">
      Select 2–3 Packing Texture Designs
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {designs.map((design) => {
        const isSelected = selectedDesigns.some((d) => d.id === design.id);
        const selectionLimitReached = selectedDesigns.length >= 3 && !isSelected;
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
      <div>
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
  </div>
);

const DesignStatusTab = ({
  history,
  normalizeUrl,
  handleCancelSubmission,
  handleSelectFinalDesign,
  handleApprove,
  handleReject,
  navigate,
}) => {
  if (!history.length)
    return <p className="text-gray-600">No designs in progress.</p>;

  const latest = history[0]; // show latest active submission

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-[#d1383a]">
        Current Design Status
      </h3>

      <div
        key={latest._id}
        className="border rounded p-4 shadow bg-gray-50"
      >
        <p className="font-medium mb-1">Status: {latest.status}</p>
        <p className="text-sm text-gray-500">
          Submitted: {new Date(latest.createdAt).toLocaleString()}
        </p>

        {latest.status === "Pending" && (
          <p className="text-sm text-blue-600 mt-1">
            Waiting for admin to review your selections...
          </p>
        )}

        {latest.selectedDesignIds?.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium">Your Selected Designs</p>
            <div className="flex gap-4 mt-1">
              {latest.selectedDesignIds.map((design, idx) => (
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

        {latest.status === "Pending" && (
          <div className="mt-4">
            <button
              onClick={() => handleCancelSubmission(latest._id)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Cancel This Submission
            </button>
            <p className="text-sm text-gray-500 mt-1">
              You can reselect designs after cancellation.
            </p>
          </div>
        )}

        {/* 1. Admin-edited designs to choose from */}
        {latest.adminEditedDesigns?.length > 0 &&
          latest.status === "Sent for Customer Approval" &&
          !latest.selectedFinalDesign && (
            <div className="mt-4 border-l-4 border-yellow-500 pl-4 bg-yellow-50 p-2 rounded">
              <p className="text-sm font-medium text-yellow-800">
                Admin has sent back {latest.adminEditedDesigns.length} edited
                design(s).
              </p>
              <p className="text-sm mt-1 text-gray-700">
                Please select your preferred version below.
              </p>

              <div className="flex gap-4 mt-2">
                {latest.adminEditedDesigns.map((edit, idx) => {
                  const isSelected = latest.selectedFinalDesign === edit.url;
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
                          onClick={() =>
                            handleSelectFinalDesign(latest._id, edit.url)
                          }
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

        {/* 2. Selected final design */}
        {latest.selectedFinalDesign && (
          <div className="mt-4">
            <p className="text-sm font-medium text-green-700">
              Your Selected Edited Design
            </p>
            {latest.status !== "Approved" && (
              <p className="text-sm text-green-700 mt-1">
                You've selected your preferred version. Waiting for final
                artwork from admin.
              </p>
            )}

            <div className="mt-2 flex flex-col items-start gap-2">
              <img
                src={`${BASE_URL}${normalizeUrl(latest.selectedFinalDesign)}`}
                alt="Final Selection"
                className="w-32 h-32 object-cover rounded border border-[#d1383a]"
              />
              <a
                href={`${BASE_URL}${normalizeUrl(latest.selectedFinalDesign)}`}
                download
                className="text-sm text-blue-600 underline"
              >
                Download Selected Design
              </a>
            </div>
          </div>
        )}

        {/* Final artwork preview */}
        {latest.finalArtworkUrl && (
          <>
            {latest.status !== "Approved" && (
              <p className="text-sm text-purple-700 mb-1">
                Final artwork is ready! Please preview and approve.
              </p>
            )}
            <div className="mt-4">
              <p className="text-sm font-medium">Final Artwork</p>
              {latest.finalArtworkType === "pdf" ? (
                <a
                  href={`${BASE_URL}/${latest.finalArtworkUrl}`}
                  className="text-blue-600 underline"
                  download
                >
                  Download PDF
                </a>
              ) : (
                <img
                  src={`${BASE_URL}/${latest.finalArtworkUrl}`}
                  className="w-32 mt-1 rounded"
                  alt="Final"
                />
              )}
            </div>
          </>
        )}

        {latest.status === "Sent for Customer Approval" &&
          latest.finalArtworkUrl && (
            <div className="mt-4 space-y-2">
              <a
                href={`${BASE_URL}/${latest.finalArtworkUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 underline"
              >
                View Final Artwork
              </a>
              <button
                onClick={() => handleApprove(latest._id)}
                className="bg-[#d1383a] text-white px-4 py-2 rounded mr-2"
              >
                Approve
              </button>
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-gray-700 underline">
                  Reject
                </summary>
                <RejectBox entryId={latest._id} onReject={handleReject} />
              </details>
            </div>
          )}

        {latest.status === "Approved" && (
          <div className="mt-3">
            <button
              className="text-[#d1383a] underline text-sm"
              onClick={() => navigate("/packing/status")}
            >
              Track Progress →
            </button>
          </div>
        )}

        {latest.status === "Pending" && latest.rejectionReason && (
          <p className="mt-2 text-sm text-red-600">
            Rejected previously: {latest.rejectionReason}
          </p>
        )}
      </div>
    </div>
  );
};


const HistoryTab = ({ history, BASE_URL }) => (
  <div>
    <h3 className="text-lg font-semibold mb-4 text-[#d1383a]">Your Submission History</h3>
    {history.length === 0 ? (
      <p className="text-gray-600">No submissions yet.</p>
    ) : (
      <ul className="space-y-4">
        {history.map((entry) => (
          <li key={entry._id} className="border rounded p-3 bg-gray-50 shadow">
            <p className="font-medium">Status: {entry.status}</p>
            <p className="text-sm text-gray-500">
              Submitted: {new Date(entry.createdAt).toLocaleString()}
            </p>
            {entry.selectedDesignIds?.length > 0 && (
              <div className="mt-2 flex gap-2">
                {entry.selectedDesignIds.map((design, idx) => (
                  <img
                    key={idx}
                    src={`${BASE_URL}${design.imageUrl}`}
                    className="w-20 h-20 object-cover rounded"
                    alt="Selected"
                  />
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    )}
  </div>
);

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
