import React, { useEffect, useState } from "react";
import axios from "../api/Axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../api/config";
import UnifiedPackingStatus from "./PackingStatusPage";

import { PenTool, FileCheck, Check, Package } from "lucide-react";
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
useGlobalNotificationChecker(customerId);
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
  } else if (selectedDesigns.length < 3) {  // ✅ 1, 2, or 3 allowed
    setSelectedDesigns([...selectedDesigns, design]);
  }
};


const handleSubmit = async () => {
  if (selectedDesigns.length < 1 || !customerId) return; // ✅ allow 1 design
  if (!selectedTrademark) {
    alert("Please select a trademark first");
    return;
  }

  try {
    const selectedIds = selectedDesigns.map((d) => d.id);
    await axios.post("/packing/submit", {
      customerId,
      trademarkName: selectedTrademark,
      selectedDesignIds: selectedIds,
    });

    setSelectedDesigns([]);
    const res = await axios.get(`/packing/history/${customerId}`);
    setHistory(res.data);
    setActiveTab("status");
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


// 🔹 Status tab dot: only while design process is ongoing (before approval)
useEffect(() => {
  if (history.length > 0) {
    const seenTime = new Date(localStorage.getItem("statusSeenTime") || 0);

    const hasNewUpdate = history.some((entry) => {
      // ❌ Ignore approved entries
      if (entry.status !== "Approved") {
        const updateTime = entry.lastAdminUpdate ? new Date(entry.lastAdminUpdate) : null;
        return updateTime && updateTime > seenTime;
      }
      return false;
    });

    setStatusDot(hasNewUpdate);
  }
}, [history]);


// 🔹 History tab dot: only for new approved entries
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
      if (customerId) {
        const tmRes = await axios.get(`/api/molecule-trademark/${customerId}`);
        
        const records = tmRes.data.data || [];
        
        // map to expected structure
        setTrademarks(records.map(r => ({ _id: r._id, trademark: r.trademarkName, molecule: r.moleculeName })));
        setMolecules(records.map(r => r.moleculeName));
      }
    } catch (err) {
      console.error("Error fetching trademark & molecule:", err);
    }
  };
  fetchOptions();
}, [customerId]);



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
          history={history.filter((h) => h.status !== "Approved")}
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
  <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-200">
    {/* Heading */}
    <h2 className="text-2xl font-bold mb-8 flex items-center gap-2 text-gray-900">
      <span className="w-2 h-8 bg-[#d1383a] rounded-full"></span>
      Select Graphic Designs
    </h2>

    {/* Design Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      {designs.map((design) => {
        const isSelected = selectedDesigns.some((d) => d.id === design.id);
        const selectionLimitReached = selectedDesigns.length >= 3 && !isSelected;

        return (
          <div
            key={design.id}
            onClick={() => {
              if (!selectionLimitReached) toggleDesignSelection(design);
            }}
            className={`relative group cursor-pointer rounded-xl overflow-hidden shadow-md border transition-all duration-300 transform ${
              isSelected
                ? "border-[#d1383a] ring-2 ring-[#d1383a] scale-105"
                : "border-gray-200 hover:border-[#d1383a]/50 hover:scale-102"
            } ${selectionLimitReached ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {/* Image */}
            <img
              src={design.image}
              alt={design.label}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Overlay if selected */}
            {isSelected && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-lg font-semibold">
                ✅ Selected
              </div>
            )}

            {/* Label */}
            <div className="p-3 text-center bg-gray-50 font-semibold text-gray-800">
              {design.label}
            </div>
          </div>
        );
      })}
    </div>

    {/* Selected Preview */}
    {selectedDesigns.length > 0 && (
      <div className="mt-6">
        <p className="text-sm font-medium mb-3 text-gray-700">
          Selected Designs:{" "}
          <span className="text-[#d1383a] font-semibold">
            {selectedDesigns.map((d) => d.label).join(", ")}
          </span>
        </p>

        <div className="flex gap-4 flex-wrap mb-6">
          {selectedDesigns.map((design) => (
            <div
              key={design.id}
              className="w-28 h-28 rounded-lg overflow-hidden shadow border border-gray-200"
            >
              <img
                src={design.image}
                alt={design.label}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
         <button
  disabled={selectedDesigns.length < 1}   // ✅ allow submit with 1+
  onClick={handleSubmit}
  className={`px-8 py-3 rounded-lg font-semibold shadow-md transition 
    ${
      selectedDesigns.length >= 1 && selectedDesigns.length <= 3
        ? "bg-gradient-to-r from-[#d1383a] to-[#b73030] text-white hover:opacity-90"
        : "bg-gray-300 text-gray-600 cursor-not-allowed"
    }`}
>
  Submit for Editing →
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
  confirmPopup,
  setConfirmPopup,
}) => {
  // Track active step per entry
  const [activeSteps, setActiveSteps] = useState({});
const [submissionUpdates, setSubmissionUpdates] = useState({});


  const steps = [
    { label: "Trademark & Molecule", icon: PenTool },
    { label: "Design Selection", icon: FileCheck },
    { label: "Admin Edits", icon: PenTool },
    { label: "Final Choice", icon: Check },
    { label: "Approval", icon: Package },
  ];
useEffect(() => {
  const updates = {};
  history.forEach((entry) => {
    let showDot = false;

    // Only track admin updates, not customer-selected designs
    (entry.adminEditedDesigns || []).forEach((design) => {
      const id = design._id || design.url;
      const lastSeen = localStorage.getItem(`submissionSeen_${id}`);
      const lastAdminUpdate = design.lastAdminUpdate || entry.updatedAt;

      if (
        lastAdminUpdate &&
        (!lastSeen || new Date(lastAdminUpdate) > new Date(lastSeen))
      ) {
        showDot = true;
      }
    });

    updates[entry._id] = showDot;
  });
  setSubmissionUpdates(updates);
}, [history]);

// ✅ Do conditional return AFTER hooks
if (!history.length) {
  return <p className="text-gray-500 italic">No designs in progress.</p>;
}

  const markAsSeen = (entry) => {
  (entry.adminEditedDesigns || []).forEach((design) => {
    const id = design._id || design.url;
    if (entry.updatedAt) {
      localStorage.setItem(`submissionSeen_${id}`, entry.updatedAt);
    }
  });
  setSubmissionUpdates((prev) => ({ ...prev, [entry._id]: false }));
};

  const getStepTimestamp = (entry, index) => {
    switch (index) {
      case 0:
        return entry.createdAt || null;
      case 1:
        return entry.selectedDesignIds?.length ? entry.updatedAt : null;
      case 2:
        return entry.adminEditedDesigns?.length ? entry.updatedAt : null;
      case 3:
        return entry.selectedFinalDesign ? entry.updatedAt : null;
      case 4:
        return entry.status === "Approved" ? entry.updatedAt : null;
      default:
        return null;
    }
  };

  const handleStepClick = (entryId, index) => {
    setActiveSteps((prev) => ({ ...prev, [entryId]: index }));
  };

  return (
    <div className="space-y-8">
      {history.map((entry) => {
        const activeStep = activeSteps[entry._id] ?? 0;

        return (
          <div
            key={entry._id}
            className="bg-white border rounded-2xl shadow-sm p-6"
             onClick={() => markAsSeen(entry)}
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {entry.trademarkName}
                </h3>
                <p className="text-sm text-gray-600">
                  Molecule: {entry.moleculeName}
                </p>
                <p className="text-xs text-gray-400">
                  Submitted: {new Date(entry.createdAt).toLocaleString()}
                </p>
              </div>
            <span className="relative inline-flex items-center">
  <span
    className={`mt-2 md:mt-0 px-3 py-1 text-xs font-medium rounded-full self-start ${
      entry.status === "Approved"
        ? "bg-[#d1383a]/10 text-[#d1383a]"
        : entry.status === "Pending"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-blue-100 text-blue-700"
    }`}
  >
    {entry.status}
  </span>

  {submissionUpdates[entry._id] && (
    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-ping" />
  )}
</span>

              
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between relative mb-8">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200" />
              {steps.map((step, index) => {
                const timestamp = getStepTimestamp(entry, index);
                const active = activeStep === index;
                const completed = Boolean(timestamp);
                const Icon = step.icon;

                return (
                  <div
                    key={step.label}
                    className="relative z-10 flex flex-col items-center cursor-pointer"
                    onClick={() => handleStepClick(entry._id, index)}
                  >
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full transition-all shadow-sm ${
                        active
                          ? "bg-[#d1383a] text-white scale-110"
                          : completed
                          ? "bg-gray-800 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    <p
                      className={`mt-2 text-xs font-medium text-center ${
                        active
                          ? "text-[#d1383a]"
                          : completed
                          ? "text-gray-800"
                          : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Step Content */}
            <div className="mt-6">
              {activeStep === 0 && (
                <p className="text-sm text-gray-600">
                  Waiting for admin to process trademark and molecule selection.
                </p>
              )}
{activeStep === 1 && (
  <>
    <p className="text-sm text-gray-600 mb-2">
      Wait for the admin to send edited versions with your trademark "{entry.trademarkName}" and molecule "{entry.moleculeName}".
    </p>
    {entry.selectedDesignIds?.length ? (
      <div>
        <p className="font-medium text-gray-800 mb-2">Your Selected Designs</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {entry.selectedDesignIds.map((design, idx) => (
            <img
              key={idx}
              src={`${BASE_URL}${design.imageUrl}`}
              alt="Selected"
              className="w-full h-28 object-cover rounded-lg border hover:ring-2 hover:ring-[#d1383a]"
            />
          ))}
        </div>
      </div>
    ) : (
      <p className="text-sm text-gray-500">No designs selected yet.</p>
    )}
    {entry.status === "Pending" && (
      <button
        onClick={() => handleCancelSubmission(entry._id)}
        className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
      >
        Cancel Submission
      </button>
    )}
  </>
)}

{activeStep === 2 && (
  <>
    <p className="text-sm text-gray-600 mb-2">
      Select any of the admin edited versions for your final artwork.
    </p>
    {entry.adminEditedDesigns?.length ? (
      <div>
        <p className="font-medium text-gray-800 mb-2">Admin Edited Versions</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {entry.adminEditedDesigns.map((edit, idx) => {
            const isSelected = entry.selectedFinalDesign === edit.url;
            return (
              <div key={idx} className="flex flex-col items-center">
                <img
                  src={`${BASE_URL}${normalizeUrl(edit.url)}`}
                  alt={`Edited ${idx + 1}`}
                  className={`w-full h-32 object-cover rounded-lg border cursor-pointer ${
                    isSelected ? "ring-2 ring-[#d1383a]" : "hover:ring-2 hover:ring-gray-400"
                  }`}
                  onClick={() =>
                    setConfirmPopup({
                      open: true,
                      entryId: entry._id,
                      designUrl: edit.url,
                    })
                  }
                />
                <a
                  href={`${BASE_URL}${normalizeUrl(edit.url)}`}
                  download
                  className="text-xs text-blue-600 underline mt-1"
                >
                  Download
                </a>
              </div>
            );
          })}
        </div>
      </div>
    ) : (
      <p className="text-sm text-gray-500">No admin edits yet.</p>
    )}
  </>
)}

{activeStep === 3 && entry.selectedFinalDesign && (
  <>
    <p className="text-sm text-gray-600 mb-2">
      Wait for the final artwork from the admin. Once it is sent, click Approve to review the final artwork.
    </p>
    <div>
      <p className="font-medium text-gray-800 mb-2">Your Final Choice</p>
      <img
        src={`${BASE_URL}${normalizeUrl(entry.selectedFinalDesign)}`}
        alt="Final Design"
        className="w-40 h-40 object-cover rounded-lg border"
      />
    </div>
  </>
)}

{activeStep === 4 && (
  <>
    {entry.finalArtworkUrl ? (
      <div>
        <p className="font-medium text-gray-800 mb-2">Final Artwork</p>
        {entry.finalArtworkType === "pdf" ? (
          <a href={`${BASE_URL}/${entry.finalArtworkUrl}`} download className="text-blue-600 underline">
            Download PDF
          </a>
        ) : (
          <img
            src={`${BASE_URL}/${entry.finalArtworkUrl}`}
            className="w-40 rounded-lg border"
            alt="Final Artwork"
          />
        )}

        {entry.finalProductImages?.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700">Final Product Images</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
              {entry.finalProductImages.map((img, idx) => (
                <a key={idx} href={`${BASE_URL}${img.url || img}`} download className="block">
                  <img
                    src={`${BASE_URL}${img.url || img}`}
                    alt={`Final Product ${idx + 1}`}
                    className="w-full h-28 object-cover rounded-lg border hover:opacity-80"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {entry.status !== "Approved" && (
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => handleApprove(entry._id)}
              className="bg-[#d1383a] text-white px-4 py-2 rounded-lg hover:bg-[#b32c2c]"
            >
              Approve
            </button>
            <details>
              <summary className="cursor-pointer text-sm text-gray-600 underline">Reject</summary>
              <RejectBox entryId={entry._id} onReject={handleReject} />
            </details>
          </div>
        )}
      </div>
    ) : (
      <p className="text-sm text-gray-500">No final artwork uploaded yet.</p>
    )}
  </>
)}

            </div>
          </div>
        );
      })}

      {/* Confirm Popup */}
      {confirmPopup.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg font-semibold mb-4">Confirm Selection</h2>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to select this design as your final choice?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() =>
                  setConfirmPopup({ open: false, entryId: null, designUrl: null })
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
    </div>
  );
};


import { BadgeCheck, Atom, ArrowRightCircle } from "lucide-react";
import useGlobalNotificationChecker from "./useGlobalNotificationChecker";

const TrademarkTab = ({
  trademarks,
  selectedTrademark,
  setSelectedTrademark,
  setActiveTab,
  setSelectedMolecule, // ✅ make sure this is passed from parent
}) => {
  // find selected trademark object
  const selectedTm = Array.isArray(trademarks)
    ? trademarks.find((tm) => tm.trademark === selectedTrademark)
    : null;

  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100 hover:shadow-2xl transition">
      {/* Heading */}
      <div className="flex items-center gap-3 mb-8">
        <span className="w-2 h-8 bg-[#d1383a] rounded-full"></span>
        <h2 className="text-2xl font-bold text-gray-900">Select Trademark</h2>
      </div>

      {/* Trademark Dropdown */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <BadgeCheck className="w-4 h-4 text-[#d1383a]" />
          Trademark
        </label>
        <select
          value={selectedTrademark || ""}
          onChange={(e) => {
            const value = e.target.value;

            if (!value) {
              // ✅ reset when empty
              setSelectedTrademark("");
              setSelectedMolecule("");
              return;
            }

            const tm = trademarks.find((t) => t.trademark === value);
            setSelectedTrademark(value);
            setSelectedMolecule(tm?.molecule || "");
          }}
          className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#d1383a] focus:border-[#d1383a] transition shadow-sm hover:shadow-md"
        >
          <option value="">-- Select Trademark --</option>
          {trademarks.map((tm) => (
            <option key={tm._id} value={tm.trademark}>
              {tm.trademark}
            </option>
          ))}
        </select>
      </div>

      {/* Show Molecule when trademark is chosen */}
      {selectedTm && (
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Atom className="w-4 h-4 text-[#d1383a]" />
            Molecule
          </label>
          <p className="px-4 py-3 bg-gray-100 rounded-lg text-gray-800">
            {selectedTm.molecule || "No molecule linked"}
          </p>
        </div>
      )}

      {/* Continue Button */}
      <div className="text-right">
        <button
          disabled={!selectedTrademark}
          onClick={() => setActiveTab("select")}
          className={`px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-md transition-all duration-300 
            ${
              selectedTrademark
                ? "bg-gradient-to-r from-[#d1383a] to-[#b73030] text-white hover:opacity-90 hover:scale-[1.02] hover:shadow-lg"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
        >
          Continue
          <ArrowRightCircle
            className={`w-5 h-5 transition ${
              selectedTrademark ? "opacity-100" : "opacity-40"
            }`}
          />
        </button>
      </div>
    </div>
  );
};




const HistoryTab = ({ history, BASE_URL }) => {
  const [open, setOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [tracklineUpdates, setTracklineUpdates] = useState({});
  const [detailsUpdates, setDetailsUpdates] = useState({});

  // Open tracking popup
  const openTracking = (entry) => {
    setSelectedSubmissionId(entry._id);
    setOpen(true);

    // mark trackingStep/postPrintStep as seen
    localStorage.setItem(
      `trackSeen_${entry._id}`,
      JSON.stringify({
        trackingStep: entry.trackingStep,
        postPrintStep: entry.postPrintStep,
      })
    );
    setTracklineUpdates((prev) => ({ ...prev, [entry._id]: false }));

    // mark all designs lastAdminUpdate as seen
    entry.selectedDesignIds?.forEach((design) => {
      if (design.lastAdminUpdate) {
        localStorage.setItem(
          `submissionSeen_${design._id}`,
          design.lastAdminUpdate
        );
      }
    });
  };

  // Toggle details view
  const toggleDetails = (entry) => {
    setExpanded((prev) => ({
      ...prev,
      [entry._id]: !prev[entry._id],
    }));

    // mark details as seen (final artwork / product images)
    const detailsTimestamp =
      entry.lastAdminUpdate || entry.finalArtworkUpdatedAt || entry.finalProductImagesUpdatedAt;

    if (detailsTimestamp) {
      localStorage.setItem(`detailsSeen_${entry._id}`, detailsTimestamp);
      setDetailsUpdates((prev) => ({ ...prev, [entry._id]: false }));
    }
  };

  // Compute blue/red dots whenever history OR detailsUpdates changes
  useEffect(() => {
    const tUpdates = {};
    const dUpdates = {};

    history.forEach((entry) => {
      // --- Blue dot: trackingStep/postPrintStep changes ---
      let lastSeenTrack = {};
      const lastSeenTrackRaw = localStorage.getItem(`trackSeen_${entry._id}`);
      if (lastSeenTrackRaw) {
        try {
          lastSeenTrack = JSON.parse(lastSeenTrackRaw);
        } catch (e) {
          lastSeenTrack = {};
        }
      }

      if (
        entry.trackingStep !== lastSeenTrack.trackingStep ||
        entry.postPrintStep !== lastSeenTrack.postPrintStep
      ) {
        tUpdates[entry._id] = true;
      }

      // --- Red dot: lastAdminUpdate / artwork / product images ---
      const lastSeenDetails = localStorage.getItem(`detailsSeen_${entry._id}`);
      const detailsTimestamp =
        entry.lastAdminUpdate || entry.finalArtworkUpdatedAt || entry.finalProductImagesUpdatedAt;

      if (
        detailsTimestamp &&
        (!lastSeenDetails || new Date(detailsTimestamp) > new Date(lastSeenDetails))
      ) {
        dUpdates[entry._id] = true;
      }
    });

    setTracklineUpdates(tUpdates);
    setDetailsUpdates(dUpdates);
  }, [history]); // <- include detailsUpdates here

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
            <li key={entry._id} className="border rounded p-3 bg-gray-50 shadow">
              <div className="flex justify-between items-center">
                <div>
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

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => openTracking(entry)}
                    className="px-4 py-2 bg-[#d1383a] text-white rounded-lg text-sm shadow hover:bg-[#b52f32] relative"
                  >
                    Trackline
                    {tracklineUpdates[entry._id] && (
                      <span className="absolute top-0 -right-1 w-3 h-3 rounded-full bg-blue-500 animate-ping" />
                    )}
                  </button>

                  <button
                    onClick={() => toggleDetails(entry)}
                    className="px-4 py-2 bg-[#d1383a] text-white rounded-lg text-sm shadow hover:bg-[#b52f32] relative"
                  >
                    {expanded[entry._id] ? "Hide Details" : "View Details"}
                    {detailsUpdates[entry._id] && (
                      <span className="absolute top-0 -right-1 w-3 h-3 rounded-full bg-red-500 animate-ping" />
                    )}
                  </button>
                </div>
              </div>
                                                  {detailsUpdates[entry._id] && (
      <p className="text-sm text-red-500 mt-1">
        New product update available. Click "View Details" to see the latest artwork or product images.
      </p>
    )}

              {expanded[entry._id] && (
                <div className="mt-6">
                  <DesignStatusTab
                    history={[entry]}
                    BASE_URL={BASE_URL}
                    normalizeUrl={(url) => url}
                    handleCancelSubmission={() => {}}
                    handleSelectFinalDesign={() => {}}
                    handleApprove={() => {}}
                    handleReject={() => {}}
                    confirmPopup={{ open: false }}
                    setConfirmPopup={() => {}}
                  />
                </div>
              )}
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
