import React, { useState, useEffect } from "react";
import Select from "react-select";
import api from "../api/Axios";



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

  const getCustomerId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?._id || user?.id || null;
    } catch {
      return null;
    }
  };

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
  fetchMoleculeOptions();
}, []);
useEffect(() => {
  if (moleculeOptions.length > 0) {
    fetchPreviousRequests();
  }
}, [moleculeOptions]);



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
    ? (() => {
        const found = moleculeOptions.find((m) => m.value === item.moleculeName);
        return found ? { ...found } : null;
      })()
    : null,
  manual: item.customMolecule || "",
  comment: item.customerComment || "", // 🗣️ customer's own comment
  adminComment: item.adminComment || "", // ✅ admin reply
  quotedAmount: item.quotedAmount || 0, // ✅ final price
  status: item.status === "Pending" ? "Pending" : "Quote Requested",
  payment: item.paymentDone
    ? "Paid"
    : item.status === "Requested Payment"
    ? "Awaiting"
    : "Not Paid",
}));



const emptyRow = {
  selected: null,
  manual: "",
  comment: "", // ✅ include comment
  status: "Pending",
  payment: "Not Paid",
};

const finalRows = fetched.length > 0
  ? [emptyRow, ...fetched]
  : [emptyRow];

setRows(finalRows);

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

const requestQuotes = rows.filter(r => !r._id || r.status === "Pending");
const quoteStatus = rows.filter(r => r._id && r.payment !== "Paid");
const quoteHistory = rows.filter(r => r.payment === "Paid");

const handleStatusClick = (row) => {
  if (row.status === "Pending") {
    setWaitingRowId(row._id);
    setShowWaitingPopup(true);
  }
};


  return (
  <div className="max-w-6xl mx-auto mt-10 p-4">
 

    {/* Tabs */}
    <div className="flex  mb-4">
      {[
        { id: "request", label: "Request Quote" },
        { id: "status", label: "Quote Status" },
        { id: "history", label: "Quote History" }
      ].map(tab => (
        <button
          key={tab.id}
          className={`px-4 py-2 ${
            activeTab === tab.id
              ? "border-b-2 border-[#d1383a] text-[#d1383a]"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>

    {/* Filtered data */}
    {(() => {
      const requestQuotes = rows.filter(r => !r._id || r.status === "Pending");
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
              <th className="p-3">Manual Entry</th>
              <th className="p-3">Rate (₹)</th>
              <th className="p-3">Comment</th>
              <th className="p-3">Status</th>
              <th className="p-3">Payment</th>
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
                  {row.selected?.amount
                    ? row.quotedAmount
                      ? `₹${row.quotedAmount}`
                      : `₹${row.selected.amount}`
                    : "-"}
                </td>

                {/* Comment */}
                <td className="p-3 space-y-1">
                  <div>
                    <textarea
                      rows={2}
                      value={row.comment}
                      readOnly
                      placeholder="Click to enter comment"
                      className={`w-full border rounded px-2 py-1 text-sm pr-6 bg-gray-50 cursor-pointer hover:ring-1 hover:ring-[#d1383a]`}
                      onClick={() => {
                        setEditingRowIndex(index);
                        setModalComment(row.comment || "");
                      }}
                    />
                  </div>
                  {row.adminComment && (
                    <div className="text-sm text-gray-700 border rounded px-2 py-1 bg-yellow-50">
                      <strong>Admin:</strong> {row.adminComment}
                    </div>
                  )}
                </td>

  <td
  className={`p-3 flex items-center gap-2 cursor-pointer ${
    row.status === "Pending" && row._id ? "text-red-600" : ""
  }`}
  onClick={() => {
    // Only show popup if the request exists (_id) and status is Pending
    if (row.status === "Pending" && row._id) {
      setWaitingRowIndex(index);
      setShowWaitingPopup(true);
    }
  }}
  title={row.status === "Pending" && row._id ? "Click for more info" : ""}
>
  {row.status === "Pending" && row._id && loadingIndexes.includes(index) && (
    <svg
      className="animate-spin h-5 w-5 text-red-600"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  )}
  <span>{row.status}</span>
</td>





                {/* Payment */}
                <td className="p-3">{row.payment}</td>

                {/* Actions */}
                <td className="p-3 flex gap-2">
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
                      {row.status || "-"}
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

    {/* Comment Modal */}
    {editingRowIndex !== null && (
      <div className="fixed inset-0 z-50 bg-black/50 bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-xl">
          <h2 className="text-lg font-semibold mb-2">
            {rows[editingRowIndex]?._id ? "Edit Comment" : "Add Comment"}
          </h2>
          <textarea
            className="w-full h-40 border rounded p-2"
            value={modalComment}
            onChange={(e) => setModalComment(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end mt-4 gap-2">
            <button
              className="px-4 py-1 rounded bg-gray-200"
              onClick={() => setEditingRowIndex(null)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-1 rounded bg-[#d1383a] text-white"
              onClick={async () => {
                const updated = [...rows];
                updated[editingRowIndex].comment = modalComment;
                setRows(updated);
                const rowToUpdate = updated[editingRowIndex];
                if (rowToUpdate._id) {
                  try {
                    await api.patch(
                      `/api/brand-request/${rowToUpdate._id}/comment`,
                      { customerComment: modalComment }
                    );
                  } catch (err) {
                    console.error("Update failed:", err);
                    alert("Error updating comment.");
                  }
                }
                setEditingRowIndex(null);
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    )}
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


  </div>
);
};
export default DynamicQuoteTable;
