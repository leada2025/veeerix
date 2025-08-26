import React, { useState, useEffect } from "react";
import Select from "react-select";
import api from "../api/Axios";
import { FiInfo, FiCheckCircle,FiLoader,FiCreditCard,FiMessageSquare  } from "react-icons/fi";



const DynamicQuoteTable = () => {
  const [rows, setRows] = useState([]);
  const [loadingIndexes, setLoadingIndexes] = useState([]);
  const [moleculeOptions, setMoleculeOptions] = useState([]);

const [savingCommentId, setSavingCommentId] = useState(null);
const [editingRowIndex, setEditingRowIndex] = useState(null);
const [modalComment, setModalComment] = useState("");
const [activeTab, setActiveTab] = useState("request"); // request | status | history

const [waitingRowIndex, setWaitingRowIndex] = useState(null);
const [showWaitingPopup, setShowWaitingPopup] = useState(false);
const [waitingRowId, setWaitingRowId] = useState(null);

const [showPaymentPopup, setShowPaymentPopup] = useState(false);
const [paymentRowId, setPaymentRowId] = useState(null);
const prevStatusCountRef = React.useRef(0);
const prevHistoryCountRef = React.useRef(0);

const [hasNewStatus, setHasNewStatus] = useState(false);
const [hasNewHistory, setHasNewHistory] = useState(false);

const [editingRowId, setEditingRowId] = useState(null);



  const getCustomerId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?._id || user?.id || null;
    } catch {
      return null;
    }
  };

const [seenChats, setSeenChats] = useState(() => {
  const customerId = getCustomerId();
  if (!customerId) return {};
  const saved = localStorage.getItem(`seenChats_${customerId}`);
  return saved ? JSON.parse(saved) : {};
});


const fetchMoleculeOptions = async () => {
  try {
    const res = await api.get("/api/molecules");
  const options = res.data.map((mol) => ({
  value: mol.name,
  label: mol.name,
   amount: mol.amount, // Add this
}));

    setMoleculeOptions(options);
  } catch (err) {
    console.error("Failed to load molecules", err);
  }
};
useEffect(() => {
  const init = async () => {
    await fetchMoleculeOptions();  // make sure this is awaited first
    await fetchPreviousRequests(); // now moleculeOptions will be available
  };
  init();
}, []);




useEffect(() => {
  const customerId = getCustomerId();
  if (!customerId) return;
  const saved = localStorage.getItem(`seenChats_${customerId}`);
  if (saved) setSeenChats(JSON.parse(saved));
}, []);



 // Load old counts from localStorage on mount
useEffect(() => {
  prevStatusCountRef.current = parseInt(localStorage.getItem("prevStatusCount") || "0", 10);
  prevHistoryCountRef.current = parseInt(localStorage.getItem("prevHistoryCount") || "0", 10);
}, []);

const fetchPreviousRequests = async () => {
  const customerId = getCustomerId();
  if (!customerId || customerId.length !== 24) {
    const empty = [{ selected: null, manual: "", status: "Pending", payment: "Not Paid" }];
    setRows(empty);
    return empty;
  }

  try {
    const response = await api.get(`/api/brand-request/${customerId}`);

    const fetched = response.data.map((item) => ({
      _id: item._id,
      selected: item.moleculeName
        ? moleculeOptions.find((m) => m.value === item.moleculeName) || null
        : null,
      manual: item.customMolecule || "",
      comment: item.customerComment || "",
      adminComment: item.adminComment || "",
      quotedAmount: item.quotedAmount || 0,
      status: item.status || "Pending",
      payment: item.paymentDone
        ? "Paid"
        : item.status === "Requested Payment"
        ? "Awaiting"
        : "Not Paid",
      messages: item.messages || [],
    }));

    const emptyRow = {
      selected: null,
      manual: "",
      comment: "",
      status: "Pending",
      payment: "Not Paid",
    };

    const finalRows = fetched.length > 0 ? [emptyRow, ...fetched] : [emptyRow];
    setRows(finalRows);

    // ✅ Count logic for status/history
    const currentStatusCount = finalRows.filter(r => r._id && r.payment !== "Paid").length;
    const currentHistoryCount = finalRows.filter(r => r.payment === "Paid").length;

    const hasApprovedAwaiting = finalRows.some(r => r.status === "Approved Awaiting" && r.payment !== "Paid");

    if ((currentStatusCount > prevStatusCountRef.current || hasApprovedAwaiting) && activeTab !== "status") {
      setHasNewStatus(true);
    }

    if (currentHistoryCount > prevHistoryCountRef.current && activeTab !== "history") {
      setHasNewHistory(true);
    }

    prevStatusCountRef.current = currentStatusCount;
    prevHistoryCountRef.current = currentHistoryCount;
    localStorage.setItem("prevStatusCount", currentStatusCount);
    localStorage.setItem("prevHistoryCount", currentHistoryCount);

    // 🔴 NEW: check for unseen admin messages
    finalRows.forEach((row) => {
      if (!row._id || !row.messages?.length) return;
      const lastMsg = row.messages[row.messages.length - 1];
      if (lastMsg.sender.toLowerCase() === "admin") {
        const lastTs = new Date(lastMsg.timestamp).getTime();
        const seenTs = seenChats[row._id] || 0;
        if (lastTs > seenTs) {
          // 👇 Show red dot on correct tab
          if (row.payment === "Paid") {
            if (activeTab !== "history") setHasNewHistory(true);
          } else {
            if (activeTab !== "status") setHasNewStatus(true);
          }
        }
      }
    });

    return finalRows;
  } catch (err) {
    console.error("Fetch error:", err);
    const fallback = [{ selected: null, manual: "", status: "Pending", payment: "Not Paid" }];
    setRows(fallback);
    return fallback;
  }
};

  const isDuplicate = (value, manual, indexToCheck) => {
    return rows.some((r, i) => {
      if (i === indexToCheck) return false;
      return (
        (value && r.selected?.value === value) ||
        (manual && r.manual.trim().toLowerCase() === manual.toLowerCase())
      );
    });
  };

  const handleSelectChange = (index, selectedOption) => {
    const updated = [...rows];
    updated[index].selected = selectedOption;
    updated[index].manual = "";
    setRows(updated);
  };

  const handleManualChange = (index, value) => {
    const updated = [...rows];
    updated[index].manual = value;
    updated[index].selected = null;
    setRows(updated);
  };

const submittedRequestCount = () => {
  return rows.filter(r => r._id && r.payment !== "Paid").length;
};



 const handleRequestQuote = async (index) => {
  const row = rows[index];
  const customerId = getCustomerId();
  const moleculeName = row.selected?.value || "";
  const manualEntry = row.manual.trim();

  if (!customerId || customerId.length !== 24) {
    alert("Invalid user session. Please login again.");
    return;
  }

  if (!moleculeName && !manualEntry) return;

  if (isDuplicate(moleculeName, manualEntry, index)) {
    alert("This molecule is already requested.");
    return;
  }
  if (submittedRequestCount() >= 5) {
    alert("You can only request up to 5 unpaid or pending quotes.");
    return;
  }
  try {
    setLoadingIndexes((prev) => [...prev, index]);

    await api.post("/api/brand-request", {
      moleculeName,
      customMolecule: manualEntry,
       customerComment: row.comment || "",
      customerId,
      // ✅ This sends the comment
    });

    await fetchPreviousRequests();
  } catch (err) {
    console.error("Quote submission failed:", err);
    alert("Error sending quote. Try again.");
  } finally {
    setLoadingIndexes((prev) => prev.filter((i) => i !== index));
  }
};


  const handleDeleteRequest = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;

    try {
      await api.delete(`/api/brand-request/${id}`);
      await fetchPreviousRequests();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete request.");
    }
  };

const handleSaveComment = async (index) => {
  const row = rows[index];
  if (!row._id || !row.comment) return;
  try {
    setSavingCommentId(row._id);
    await api.patch(`/api/brand-request/${row._id}/comment`, {
      customerComment: row.comment,
    });
  } catch (err) {
    console.error("Comment save failed", err);
    alert("Failed to save comment");
  } finally {
    setSavingCommentId(null);
  }
};

// Inside your render function, replace the current filtering logic with:
const markChatSeen = (row) => {
  const lastMsg = row.messages?.[row.messages.length - 1];
  if (lastMsg && lastMsg.sender.toLowerCase() === "admin") {
    const ts = new Date(lastMsg.timestamp).getTime();

    setSeenChats((prev) => {
      const updated = { ...prev, [row._id]: ts };
      localStorage.setItem(`seenChats_${getCustomerId()}`, JSON.stringify(updated));
 // ✅ always in sync
      return updated;
    });
  }
};




const handleStatusClick = (row) => {
  if (row.status === "Pending") {
    setWaitingRowId(row._id);
    setShowWaitingPopup(true);
  }
};

const handleTabClick = (tabId) => {
  setActiveTab(tabId);
  if (tabId === "status") setHasNewStatus(false);
  if (tabId === "history") setHasNewHistory(false);
};



  return (
  <div className="max-w-6xl mx-auto mt-10 p-4">
 

    {/* Tabs */}
 <div className="flex mb-4">
        {[
          { id: "request", label: "Request Quote" },
          { id: "status", label: "Quote Status", badge: hasNewStatus },
          { id: "history", label: "Quote History", badge: hasNewHistory }
        ].map(tab => (
          <button
            key={tab.id}
            className={`relative px-4 py-2 ${
              activeTab === tab.id
                ? "border-b-2 border-[#d1383a] text-[#d1383a]"
                : "text-gray-500"
            }`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
            {tab.badge && <span className="heartbeat-dot"></span>}
          </button>
        ))}
      </div>

    {/* Filtered data */}
    {(() => {
      const requestQuotes = rows.filter(r => !r._id);
      const quoteStatus = rows.filter(r => r._id && r.payment !== "Paid");
      const quoteHistory = rows.filter(r => r.payment === "Paid");

      const displayedRows =
        activeTab === "request"
          ? requestQuotes
          : activeTab === "status"
          ? quoteStatus
          : quoteHistory;

      return (
        <table className="w-full table-auto text-sm text-left">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="p-3">Molecule Category</th>
              <th className="p-3"></th>
              <th className="p-3">Rate (₹)</th>
              <th className="p-3">Open Chat</th>
              <th className="p-3">Status</th>
             
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {displayedRows.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {/* Molecule Category */}
                <td className="p-3">
                  {row._id ? (
                    <span>{row.selected?.label || "-"}</span>
                  ) : (
                    <Select
                      options={moleculeOptions}
                      value={row.selected}
                      onChange={(option) => handleSelectChange(index, option)}
                      placeholder="Select Molecule"
                      className="text-sm"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: "36px",
                          borderColor: "#d1383a",
                          boxShadow: "none",
                          "&:hover": { borderColor: "#b73030" },
                        }),
                      }}
                    />
                  )}
                </td>

                {/* Manual Entry */}
                <td className="p-3">
                  <input
                    type="text"
                    value={row.manual}
                    onChange={(e) => handleManualChange(index, e.target.value)}
                    placeholder="If not in the list, type here"
                    className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-[#d1383a] bg-white"
                    disabled={!!row._id}
                  />
                </td>

                {/* Rate */}
              <td className="p-3">
  {row.quotedAmount
    ? `₹${row.quotedAmount}`
    : row.selected?.amount
    ? `₹${row.selected.amount}`
    : "-"}
</td>


                {/* Comment */}
         {/* Comment / Chat Trigger */}
<td className="p-3">
  {row._id ? (
    <button
      onClick={() => {
        setEditingRowId(row._id);
        setModalComment("");
        markChatSeen(row); // ✅ mark with timestamp
      }}
      className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200"
    >
      <FiMessageSquare className="w-5 h-5 text-[#d1383a]" />

      {/* 🔴 Show dot only if there's a newer admin msg */}
  {(() => {
  const lastMsg = row.messages?.[row.messages.length - 1];
  if (!lastMsg || lastMsg.sender.toLowerCase() !== "admin") return null;

  const lastTs = new Date(lastMsg.timestamp).getTime();
  const seenTs = seenChats[row._id] || 0;

  return lastTs > seenTs ? (
    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
  ) : null;
})()}


    </button>
  ) : (
    <span className="text-gray-400 text-xs">No Chat</span>
  )}
</td>



<td
  className={`p-3 flex items-center gap-2 cursor-pointer ${
    row.payment === "Paid"
      ? "text-green-600"
      : row.status === "Pending"
      ? "text-yellow-600"
      : row.status === "Approved Awaiting" || row.status === "Requested Payment"
      ? "text-blue-600"
      : ""
  }`}
  onClick={() => {
    if (row.payment === "Paid") return; // ✅ No popup for Paid

    if (row.status === "Pending" && row._id) {
      setWaitingRowIndex(index);
      setShowWaitingPopup(true);
    } else if (
      (row.status === "Requested Payment" || row.status === "Approved Awaiting") &&
      row._id
    ) {
      setPaymentRowId(row._id);
      setShowPaymentPopup(true);
    }
  }}
>
  {/* Icon */}
  {row.payment === "Paid" ? (
    <FiCheckCircle className="h-5 w-5 text-green-600" />
  ) : row.status === "Pending" ? (
    <FiLoader className="h-5 w-5 text-yellow-600 animate-spin" />
  ) : row.status === "Approved Awaiting" || row.status === "Requested Payment" ? (
    <FiCreditCard className="h-5 w-5 text-blue-600" />
  ) : null}

  {/* Label */}
  <span>
    {row.payment === "Paid" ? "Paid" : row.status}
  </span>
</td>






                {/* Payment */}
               

                {/* Actions */}
                <td className="p-3  gap-2">
                  {row.status === "Pending" && activeTab === "request" ? (
                    <button
                      onClick={() => handleRequestQuote(index)}
                      disabled={loadingIndexes.includes(index) || row._id}
                      className={`px-3 py-1 rounded text-white ${
                        loadingIndexes.includes(index) || row._id
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-[#d1383a] hover:bg-[#b73030]"
                      }`}
                    >
                      {loadingIndexes.includes(index)
                        ? "Requesting..."
                        : "Request Quote"}
                    </button>
                  ) : (
                    <span className="text-gray-500">
                      {/* {row.status || "-"} */}
                    </span>
                  )}

                  {row._id && (
                 <button
  onClick={() => handleDeleteRequest(row._id)}
  className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-xs transition"
>
  Delete
</button>

                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    })()}

 
  {showWaitingPopup && (
  <div
    className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50"
    onClick={() => {
      setShowWaitingPopup(false);
      setWaitingRowIndex(null);
    }}
  >
    <div
      className="bg-white p-6 rounded-lg max-w-sm text-center"
      onClick={(e) => e.stopPropagation()} // Prevent modal closing when clicking inside
    >
      <p className="text-lg font-semibold">
        Please wait, admin will update you soon.
      </p>
      <button
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
        onClick={() => {
          setShowWaitingPopup(false);
          setWaitingRowIndex(null);
        }}
      >
        Close
      </button>
    </div>
  </div>
)}
{showPaymentPopup && (
  <div
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    onClick={() => {
      setShowPaymentPopup(false);
      setPaymentRowId(null);
    }}
  >
    <div
      className="bg-white p-6 rounded-lg max-w-sm text-center"
      onClick={(e) => e.stopPropagation()}
    >
      <p className="text-lg font-semibold mb-4">
        Admin requested you to pay. Please make the payment.
      </p>
      <button
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        onClick={() => {
          // 🔹 Here trigger your payment API or redirect
          alert("Payment flow started for row: " + paymentRowId);
          setShowPaymentPopup(false);
          setPaymentRowId(null);
        }}
      >
        Pay Now
      </button>&nbsp;&nbsp;&nbsp;
      <button
        className="mt-3 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
        onClick={() => {
          setShowPaymentPopup(false);
          setPaymentRowId(null);
        }}
      >
        Cancel
      </button>
    </div>
  </div>
)}

{editingRowId && (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
    <div className="bg-white w-[400px] max-h-[80vh] rounded-xl shadow-xl flex flex-col">
      
      {/* Header */}
      <div className="p-3 border-b flex justify-between items-center">
        <h2 className="font-semibold">Chat</h2>
        <button onClick={() => setEditingRowId(null)}>✕</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {rows.find(r => r._id === editingRowId)?.messages?.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg max-w-[70%] ${
              msg.sender === "customer"
                ? "bg-blue-100 self-end ml-auto"
                : "bg-gray-200"
            }`}
          >
            <div className="text-xs font-semibold text-gray-600">
              {msg.sender === "customer" ? "You" : "Admin"}
            </div>
            <div className="text-sm">{msg.text}</div>
            <div className="text-xs text-gray-500">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t flex gap-2">
        <input
          type="text"
          value={modalComment}
          onChange={(e) => setModalComment(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded px-2 py-1"
        />
        <button
          className="px-3 py-1 bg-[#d1383a] text-white rounded"
          onClick={async () => {
            const rowToUpdate = rows.find(r => r._id === editingRowId);
            if (!rowToUpdate?._id || !modalComment.trim()) return;

            try {
              const res = await api.patch(
                `/api/brand-request/${rowToUpdate._id}/message`,
                {
                  sender: "customer",
                  text: modalComment.trim(),
                }
              );

              const updatedDoc = res.data;
              const updatedMessages = updatedDoc.messages || [];

              setRows(prev =>
                prev.map(r =>
                  r._id === rowToUpdate._id
                    ? { ...r, messages: updatedMessages }
                    : r
                )
              );

              setModalComment("");
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
export default DynamicQuoteTable;
