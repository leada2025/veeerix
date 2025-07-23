import React, { useState, useEffect } from "react";

const ApproveModal = ({ suggestion, onClose, onApprove }) => {
  const [approvedNames, setApprovedNames] = useState([]);
  const [remark, setRemark] = useState("");

  useEffect(() => {
    setApprovedNames([]);
    setRemark("");
  }, [suggestion]);

  const toggleSelect = (name) => {
    setApprovedNames((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name)
        : prev.length < 5
        ? [...prev, name]
        : prev
    );
  };

  const handleApprove = () => {
    if (approvedNames.length === 0) {
      alert("Select at least one name to approve.");
      return;
    }
    onApprove(suggestion._id, approvedNames, remark);
  };

  if (!suggestion || !Array.isArray(suggestion.suggestions)) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white w-full max-w-md mx-auto rounded-2xl shadow-xl p-6 relative border border-[#d1383a]">
        <h2 className="text-xl font-semibold mb-4 text-[#d1383a]">
          Approve Trademark Suggestions
        </h2>

        <div className="space-y-2 max-h-60 overflow-y-auto border p-3 rounded-md">
          {suggestion.suggestions.map((sug, idx) => (
            <label
              key={idx}
              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
            >
              <input
                type="checkbox"
                checked={approvedNames.includes(sug.name)}
                onChange={() => toggleSelect(sug.name)}
                disabled={
                  !approvedNames.includes(sug.name) &&
                  approvedNames.length >= 5
                }
              />
              <span className="text-sm">
                {sug.name}{" "}
                <span className="text-xs text-gray-500">({sug.status})</span>
              </span>
            </label>
          ))}
        </div>

        <textarea
          placeholder="Add a remark (optional)"
          className="w-full mt-4 border rounded p-2"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
        />

        <div className="flex justify-end mt-4 gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleApprove}
            className="px-4 py-2 bg-[#d1383a] hover:bg-[#b93032] text-white rounded font-medium text-sm"
          >
            Approve Selected
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveModal;
