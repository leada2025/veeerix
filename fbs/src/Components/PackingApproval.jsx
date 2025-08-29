import React, { useEffect, useState } from "react";
import axios from "../api/Axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../api/config";
import UnifiedPackingStatus from "./PackingStatusPage";

const CustomerPackingPage = () => {
  const [designs, setDesigns] = useState([]);
  const [selectedDesigns, setSelectedDesigns] = useState([]);
  const [history, setHistory] = useState([]);
  const [hasPending, setHasPending] = useState(false);
 const [activeTab, setActiveTab] = useState("trademark"); // trademark | select | status | history
// select | status | history
const [statusDot, setStatusDot] = useState(false);
const [historyDot, setHistoryDot] = useState(false);

const [trademarks, setTrademarks] = useState([]);
const [molecules, setMolecules] = useState([]);
const [selectedTrademark, setSelectedTrademark] = useState(null);
const [selectedMolecule, setSelectedMolecule] = useState(null);

const [confirmPopup, setConfirmPopup] = useState({
  open: false,
  entryId: null,
  designUrl: null,
});
const stepLabels = [
   "Trademark & Molecule Selected",
  "Select Design",
  "Edited Version Sent",
  "Customer Approved",
  "Final Artwork Sent",
];
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
  if (!selectedTrademark || !selectedMolecule) {
    alert("Please select trademark & molecule first");
    return;
  }

  try {
    const selectedIds = selectedDesigns.map((d) => d.id);
    await axios.post("/packing/submit", {
      customerId,
      trademarkName: selectedTrademark,
      moleculeName: selectedMolecule,
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


useEffect(() => {
  if (history.length > 0) {
    const seenTime = new Date(localStorage.getItem("statusSeenTime") || 0);

    // find if ANY submission has a newer admin update than what we saw
    const hasNewUpdate = history.some((entry) => {
      const updateTime = entry.lastAdminUpdate ? new Date(entry.lastAdminUpdate) : null;
      return updateTime && updateTime > seenTime;
    });

    setStatusDot(hasNewUpdate);
  }
}, [history]);




useEffect(() => {
  if (history.length > 0) {
    const seenTime = new Date(localStorage.getItem("historySeenTime") || 0);

    const hasNewApproved = history.some((entry) => {
      if (entry.status === "Approved") {
        const approvedTime = new Date(entry.updatedAt || entry.createdAt);
        return approvedTime > seenTime;
      }
      return false;
    });

    setHistoryDot(hasNewApproved);
  }
}, [history]);


useEffect(() => {
  const fetchOptions = async () => {
    try {
      const [tmRes, molRes] = await Promise.all([
        axios.get("/packing/trademarks"),
        axios.get("/packing/molecules"),
      ]);
      setTrademarks(tmRes.data);
      setMolecules(molRes.data);
    } catch (err) {
      console.error("Error fetching trademark/molecule:", err);
    }
  };
  fetchOptions();
}, []);

  // ================= RENDER =================
  return (
    <div className="max-w-6xl mx-auto mt-10 p-4">
      {/* Tabs */}
      <div className="flex gap-6 mb-6">

      {/* Trademark & Molecule */}
<button
  className={`relative pb-2 ${
    activeTab === "trademark"
      ? "border-b-2 border-[#d1383a] font-semibold text-[#d1383a]"
      : "text-gray-600"
  }`}
  onClick={() => setActiveTab("trademark")}
>
  Trademark & Molecule
</button>

  {/* Select Design */}
  <button
    className={`relative pb-2 ${activeTab === "select" ? "border-b-2 border-[#d1383a] font-semibold text-[#d1383a]" : "text-gray-600"}`}
    onClick={() => setActiveTab("select")}
  >
    Select Design
  </button>

<button
  className={`relative pb-2 ${
    activeTab === "status"
      ? "border-b-2 border-[#d1383a] font-semibold text-[#d1383a]"
      : "text-gray-600"
  }`}
  onClick={() => {
    setActiveTab("status");
    setStatusDot(false); // hide dot visually

  if (history.length > 0) {
  const latestUpdate = history.reduce((latest, entry) => {
    const update = entry.lastAdminUpdate ? new Date(entry.lastAdminUpdate) : null;
    return update && update > latest ? update : latest;
  }, new Date(0));

  localStorage.setItem("statusSeenTime", latestUpdate.toISOString());

    }
  }}
>
  Design Status
  {statusDot && <span className="heartbeat-dot"></span>}
</button>





{/* History */}
<button
  className={`relative pb-2 ${
    activeTab === "history"
      ? "border-b-2 border-[#d1383a] font-semibold text-[#d1383a]"
      : "text-gray-600"
  }`}
  onClick={() => {
    setActiveTab("history");
    setHistoryDot(false);
    if (history.length > 0) {
  const latestApproved = history.reduce((latest, entry) => {
    if (entry.status === "Approved") {
      const approvedTime = new Date(entry.updatedAt || entry.createdAt);
      return approvedTime > latest ? approvedTime : latest;
    }
    return latest;
  }, new Date(0));

  if (latestApproved > new Date(0)) {
    localStorage.setItem("historySeenTime", latestApproved.toISOString());
  }
}
  }}
>
  History
  {historyDot && <span className="heartbeat-dot"></span>}
</button>

</div>

{activeTab === "trademark" && (
  <TrademarkTab
    trademarks={trademarks}
    molecules={molecules}
    selectedTrademark={selectedTrademark}
    selectedMolecule={selectedMolecule}
    setSelectedTrademark={setSelectedTrademark}
    setSelectedMolecule={setSelectedMolecule}
    setActiveTab={setActiveTab}
  />
)}


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
           confirmPopup={confirmPopup}        // 👈 added
    setConfirmPopup={setConfirmPopup}  
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
  confirmPopup,
  setConfirmPopup,
}) => {
  if (!history.length)
    return <p className="text-gray-600">No designs in progress.</p>;

  // Define steps
  const stepLabels = [
    "Trademark & Molecule Selected",
    "Select Design",
    "Admin Edited Version Sent",
    "Select Final Design",
    "Approve Final Artwork",
  ];

  // Helper: get completion timestamp per step
 const getStepTimestamp = (entry, index) => {
  switch (index) {
    case 0: // Trademark & Molecule Selected
      return entry.createdAt || null;

    case 1: // Select Design
      return entry.selectedDesignIds?.length > 0 ? entry.updatedAt : null;

    case 2: // Admin Edited Version Sent
      return entry.adminEditedDesigns?.length > 0 ? entry.updatedAt : null;

    case 3: // Select Final Design
      return entry.selectedFinalDesign ? entry.updatedAt : null;

    case 4: // Approve Final Artwork
      return entry.status === "Approved" ? entry.updatedAt : null;

    default:
      return null;
  }
};


  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4 text-[#d1383a]">
        Current Design Status
      </h3>

      {history.map((entry) => (
        <div
          key={entry._id}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 border rounded p-4 shadow bg-gray-50 mb-4"
        >
          {/* ---------- LEFT SIDE: FULL LOGIC (your existing flow) ---------- */}
          <div>
            {/* Status + Timestamp */}
                <p className="font-medium mb-1">
        Trademark: <span className="text-[#d1383a]">{entry.trademarkName}</span>
      </p>
      <p className="font-medium mb-1">
        Molecule: <span className="text-[#d1383a]">{entry.moleculeName}</span>
      </p>
            <p className="font-medium mb-1">Status: {entry.status}</p>
            <p className="text-sm text-gray-500">
              Submitted: {new Date(entry.createdAt).toLocaleString()}
            </p>

            {/* Pending Notice */}
            {entry.status === "Pending" && (
              <p className="text-sm text-blue-600 mt-1">
                Waiting for admin to review your selections...
              </p>
            )}

            {/* Selected Designs */}
            {entry.selectedDesignIds?.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium">Your Selected Designs</p>
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

            {/* Cancel Submission if Pending */}
            {entry.status === "Pending" && (
              <div className="mt-4">
                <button
                  onClick={() => handleCancelSubmission(entry._id)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Cancel This Submission
                </button>
                <p className="text-sm text-gray-500 mt-1">
                  You can reselect designs after cancellation.
                </p>
              </div>
            )}

            {/* Admin Edited Designs */}
            {entry.adminEditedDesigns?.length > 0 &&
              entry.status === "Sent for Customer Approval" &&
              !entry.selectedFinalDesign && (
                <div className="mt-4 border-l-4 border-yellow-500 pl-4 bg-yellow-50 p-2 rounded">
                  <p className="text-sm font-medium text-yellow-800">
                    Admin has sent back {entry.adminEditedDesigns.length} edited
                    design(s).
                  </p>
                  <p className="text-sm mt-1 text-gray-700">
                    Please select your preferred version below.
                  </p>

                  <div className="flex gap-4 mt-2">
                    {entry.adminEditedDesigns.map((edit, idx) => {
                      const isSelected =
                        entry.selectedFinalDesign === edit.url;
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
                                setConfirmPopup({
                                  open: true,
                                  entryId: entry._id,
                                  designUrl: edit.url,
                                })
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

            {/* ✅ Confirmation Popup */}
            {confirmPopup.open && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/10 bg-opacity z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                  <h2 className="text-lg font-semibold mb-4 text-gray-800">
                    Confirm Selection
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Are you sure you want to select this design as your final
                    choice?
                  </p>
                  <div className="flex justify-end gap-4">
                    <button
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                      onClick={() =>
                        setConfirmPopup({
                          open: false,
                          entryId: null,
                          designUrl: null,
                        })
                      }
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 bg-[#d1383a] text-white rounded hover:bg-[#a12d2f]"
                      onClick={() => {
                        handleSelectFinalDesign(
                          confirmPopup.entryId,
                          confirmPopup.designUrl
                        );
                        setConfirmPopup({
                          open: false,
                          entryId: null,
                          designUrl: null,
                        });
                      }}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Final Design Selected */}
            {entry.selectedFinalDesign && (
              <div className="mt-4">
                <p className="text-sm font-medium text-green-700">
                  Your Selected Edited Design
                </p>
                {entry.status !== "Approved" && (
                  <p className="text-sm text-green-700 mt-1">
                    You've selected your preferred version. Waiting for final
                    artwork from admin.
                  </p>
                )}
                <div className="mt-2 flex flex-col items-start gap-2">
                  <img
                    src={`${BASE_URL}${normalizeUrl(
                      entry.selectedFinalDesign
                    )}`}
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

            {/* Final Artwork Preview */}
            {entry.finalArtworkUrl && (
              <>
                {entry.status !== "Approved" && (
                  <p className="text-sm text-purple-700 mb-1">
                    Final artwork is ready! Please preview and approve.
                  </p>
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

            {entry.finalProductImages?.length > 0 && (
  <div className="mt-4">
    <p className="text-sm font-medium">📦 Final Product Images</p>
    <div className="flex flex-wrap gap-4 mt-2">
      {entry.finalProductImages.map((img, idx) => (
        <div key={idx} className="flex flex-col items-center">
          <img
            src={`${BASE_URL}${img.url || img}`}
            alt={`Final Product ${idx + 1}`}
            className="w-32 h-32 object-cover rounded border"
          />
          <a
            href={`${BASE_URL}${img.url || img}`}
            download
            className="text-xs mt-1 text-blue-600 underline"
          >
            Download
          </a>
        </div>
      ))}
    </div>
  </div>
)}

            {/* Approve / Reject Buttons */}
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
                    <RejectBox entryId={entry._id} onReject={handleReject} />
                  </details>
                </div>
              )}

            {/* Approved → Track */}
        

            {/* Rejection Reason */}
            {entry.status === "Pending" && entry.rejectionReason && (
              <p className="mt-2 text-sm text-red-600">
                Rejected previously: {entry.rejectionReason}
              </p>
            )}
          </div>

          {/* ---------- RIGHT SIDE: TRACKER ---------- */}
      <div className="relative border-l-4 border-gray-200 pl-8 mt-6">
  {stepLabels.map((label, index) => {
    const timestamp = getStepTimestamp(entry, index); // should map correctly
    const completed = Boolean(timestamp);

    return (
      <div key={label} className="mb-10 relative">
        {/* Step Circle */}
        <div
          className={`absolute -left-6 top-1 flex items-center justify-center w-10 h-10 rounded-full text-white text-sm font-bold shadow-md ${
            completed ? "bg-[#d1383a]" : "bg-gray-400"
          }`}
        >
          {index + 1}
        </div>

        {/* Step Content */}
        <div className="ml-10">
          <p
            className={`text-base font-semibold ${
              completed ? "text-[#d1383a]" : "text-gray-600"
            }`}
          >
            {label}
          </p>
          {timestamp ? (
            <p className="text-xs text-gray-500 mt-1">
              ✅ Completed on {new Date(timestamp).toLocaleString()}
            </p>
          ) : (
            <p className="text-xs text-gray-400 mt-1">⏳ Pending</p>
          )}
        </div>
      </div>
    );
  })}
</div>

        </div>
      ))}
    </div>
  );
};

const TrademarkTab = ({
  trademarks,
  molecules,
  selectedTrademark,
  selectedMolecule,
  setSelectedTrademark,
  setSelectedMolecule,
  setActiveTab,
}) => (
  <div>
    <h2 className="text-xl font-bold mb-6 text-[#d1383a]">Select Trademark & Molecule</h2>

    {/* Trademark Dropdown */}
    <div className="mb-6">
      <label className="block text-sm font-medium mb-1">Trademark</label>
      <select
        value={selectedTrademark || ""}
        onChange={(e) => setSelectedTrademark(e.target.value)}
        className="w-full border rounded px-3 py-2"
      >
        <option value="">-- Select Trademark --</option>
        {trademarks.map((tm) => (
          <option key={tm._id} value={tm.selectedName}>
            {tm.selectedName}
          </option>
        ))}
      </select>
    </div>

    {/* Molecule Dropdown */}
{/* Molecule Dropdown */}
<div className="mb-6">
  <label className="block text-sm font-medium mb-1">Molecule</label>
  <select
    value={selectedMolecule || ""}
    onChange={(e) => setSelectedMolecule(e.target.value)}
    className="w-full border rounded px-3 py-2"
  >
    <option value="">-- Select Molecule --</option>
    {molecules.map((mol) => {
      const displayName = mol.moleculeName?.trim() || mol.customMolecule || "Unnamed";
      return (
        <option key={mol._id} value={displayName}>
          {displayName}
        </option>
      );
    })}
  </select>
</div>




    <div className="text-right">
      <button
        className={`px-6 py-2 rounded text-white ${
          selectedTrademark && selectedMolecule
            ? "bg-[#d1383a] hover:bg-[#b8302d]"
            : "bg-gray-400 cursor-not-allowed"
        }`}
        disabled={!selectedTrademark || !selectedMolecule}
        onClick={() => setActiveTab("select")}
      >
        Continue →
      </button>
    </div>
  </div>
);


const HistoryTab = ({ history, BASE_URL }) => {
  const [open, setOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [submissionUpdates, setSubmissionUpdates] = useState({});

  const openTracking = (submissionId, designs) => {
    setSelectedSubmissionId(submissionId);
    setOpen(true);

    // mark all designs as seen
    designs.forEach((design) => {
      if (design.lastAdminUpdate) {
        localStorage.setItem(`submissionSeen_${design._id}`, design.lastAdminUpdate);
      }
    });

    // hide red dot for this submission
    setSubmissionUpdates((prev) => ({ ...prev, [submissionId]: false }));
  };

  // compute red dots whenever history changes
  useEffect(() => {
    const updates = {};
    history.forEach((entry) => {
      let showDot = false;
      entry.selectedDesignIds?.forEach((design) => {
        const lastSeen = localStorage.getItem(`submissionSeen_${design._id}`);
        const lastAdminUpdate = design.lastAdminUpdate;
        if (lastAdminUpdate && (!lastSeen || new Date(lastAdminUpdate) > new Date(lastSeen))) {
          showDot = true;
        }
      });
      updates[entry._id] = showDot;
    });
    setSubmissionUpdates(updates);
  }, [history]);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4 text-[#d1383a]">
        Your Submission History
      </h3>

      {history?.length === 0 ? (
        <p className="text-gray-600">No submissions yet.</p>
      ) : (
        <ul className="space-y-4">
          {history.map((entry) => (
            <li
              key={entry._id}
              className="border rounded p-3 bg-gray-50 shadow flex justify-between items-center"
            >
              {/* Left side: status + thumbnails */}
              <div className="flex flex-col">
                         <p className="font-medium mb-1">
        Trademark: <span className="text-[#d1383a]">{entry.trademarkName}</span>
      </p>
      <p className="font-medium mb-1">
        Molecule: <span className="text-[#d1383a]">{entry.moleculeName}</span>
      </p>
                <p className="font-medium">Status: {entry.status}</p>
                <p className="text-sm text-gray-500">
                  Submitted: {new Date(entry.createdAt).toLocaleString()}
                </p>
                {entry.selectedDesignIds?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-4">
                    {entry.selectedDesignIds.map((design) => (
                      <img
                        key={design._id}
                        src={`${BASE_URL}${design.imageUrl}`}
                        className="w-16 h-16 object-cover rounded border"
                        alt="Selected"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Trackline button */}
              <button
                onClick={() => openTracking(entry._id, entry.selectedDesignIds)}
                className="ml-4 px-4 py-2 bg-[#d1383a] text-white rounded-lg text-sm shadow hover:bg-[#b52f32] relative"
              >
                Trackline
                {submissionUpdates[entry._id] && (
                  <span className="absolute top-0 -right-1 w-3 h-3 rounded-full bg-blue-500 animate-ping" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && selectedSubmissionId && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl max-h-[80vh] overflow-y-auto relative p-6">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-lg"
            >
              ✕
            </button>

            <UnifiedPackingStatus
              isPopup
              submissionId={selectedSubmissionId}
            />
          </div>
        </div>
      )}
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
