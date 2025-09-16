import React, { useState, useEffect } from "react";
import axios from "../api/Axios";
import { Edit, Save, Trash2 } from "lucide-react";
export default function MoleculeTrademarkPage() {
  // ✅ always read user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const customerId = user?.id;

  const [activeTab, setActiveTab] = useState("add");
  const [moleculeName, setMoleculeName] = useState("");
  const [trademarkName, setTrademarkName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [records, setRecords] = useState([]);

  // Fetch records when switching to "records" tab
  useEffect(() => {
    if (activeTab === "records") fetchRecords();
  }, [activeTab]);

  const fetchRecords = async () => {
    try {
      if (!customerId) return;
      const res = await axios.get(`/api/molecule-trademark/${customerId}`);
      setRecords(res.data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setRecords([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerId) {
      setMessage({ type: "error", text: "Customer not logged in." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await axios.post("/api/molecule-trademark/add", {
        customerId,
        moleculeName,
        trademarkName,
      });

      setMessage({ type: "success", text: res.data.message || "Saved!" });
      setMoleculeName("");
      setTrademarkName("");

      // refresh records if tab is records
      if (activeTab === "records") fetchRecords();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };
const handleUpdate = async (id, idx) => {
  try {
    const record = records[idx];
    await axios.put(`/api/molecule-trademark/edit/${id}`, {
      customerId,
      moleculeName: record.moleculeName,
      trademarkName: record.trademarkName,
    });
    alert("Record updated successfully");
    fetchRecords();
  } catch (err) {
    alert(err.response?.data?.message || "Update failed");
  }
};

const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this record?")) return;
  try {
    await axios.delete(`/api/molecule-trademark/delete/${id}`);
    alert("Record deleted successfully");
    fetchRecords();
  } catch (err) {
    alert(err.response?.data?.message || "Delete failed");
  }
};

const toggleEdit = (idx) => {
  const newRecords = [...records];
  newRecords[idx].isEditing = true;
  setRecords(newRecords);
};


  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-2xl border border-gray-200">
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab("add")}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === "add"
              ? "text-[#d1383a] border-b-2 border-[#d1383a]"
              : "text-gray-500 hover:text-[#d1383a]"
          }`}
        >
          ➕ Add
        </button>
        <button
          onClick={() => setActiveTab("records")}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === "records"
              ? "text-[#d1383a] border-b-2 border-[#d1383a]"
              : "text-gray-500 hover:text-[#d1383a]"
          }`}
        >
          📑 Records
        </button>
      </div>

      {/* Add Form */}
      {activeTab === "add" && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Heading */}
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-900">
            <span className="w-2 h-6 bg-[#d1383a] rounded-full"></span>
            Add Molecule & Trademark
          </h2>

          {/* Molecule Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Molecule Name
            </label>
            <input
              type="text"
              value={moleculeName}
              onChange={(e) => setMoleculeName(e.target.value)}
              placeholder="Enter molecule name"
              required
              className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#d1383a] focus:border-[#d1383a] outline-none"
            />
          </div>

          {/* Trademark Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trademark Name
            </label>
            <input
              type="text"
              value={trademarkName}
              onChange={(e) => setTrademarkName(e.target.value)}
              placeholder="Enter trademark name"
              required
              className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#d1383a] focus:border-[#d1383a] outline-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 rounded-lg font-semibold shadow-md transition 
                ${
                  loading
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#d1383a] to-[#b73030] text-white hover:opacity-90"
                }`}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>

          {/* Message */}
          {message && (
            <p
              className={`mt-4 text-sm font-medium ${
                message.type === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {message.text}
            </p>
          )}
        </form>
      )}

      {/* Records Table */}
      {/* Records Table */}


{activeTab === "records" && (
  <div>
    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900">
      <span className="w-2 h-6 bg-[#d1383a] rounded-full"></span>
      Molecule & Trademark Records
    </h2>

    {records.length === 0 ? (
      <p className="text-gray-600">No records found.</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-lg overflow-hidden">
          <thead className="bg-[#d1383a] text-white">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Molecule Name</th>
              <th className="px-4 py-3 text-left">Trademark Name</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec, idx) => (
              <tr key={rec._id} className="border-b hover:bg-gray-50 transition">
                <td className="px-4 py-3">{idx + 1}</td>

                {/* Molecule Name */}
                <td className="px-4 py-3">
                  {rec.isEditing ? (
                    <input
                      type="text"
                      value={rec.moleculeName}
                      onChange={(e) => {
                        const newRecords = [...records];
                        newRecords[idx].moleculeName = e.target.value;
                        setRecords(newRecords);
                      }}
                      className="w-full border px-2 py-1 rounded"
                    />
                  ) : (
                    rec.moleculeName
                  )}
                </td>

                {/* Trademark Name */}
                <td className="px-4 py-3">
                  {rec.isEditing ? (
                    <input
                      type="text"
                      value={rec.trademarkName}
                      onChange={(e) => {
                        const newRecords = [...records];
                        newRecords[idx].trademarkName = e.target.value;
                        setRecords(newRecords);
                      }}
                      className="w-full border px-2 py-1 rounded"
                    />
                  ) : (
                    rec.trademarkName
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-3 flex gap-2">
                  {rec.isEditing ? (
                    <Save
                      className="w-5 h-5 text-green-500 cursor-pointer hover:text-green-600"
                      onClick={() => handleUpdate(rec._id, idx)}
                    />
                  ) : (
                    <Edit
                      className="w-5 h-5 text-blue-500 cursor-pointer hover:text-blue-600"
                      onClick={() => toggleEdit(idx)}
                    />
                  )}

                  <Trash2
                    className="w-5 h-5 text-red-500 cursor-pointer hover:text-red-600"
                    onClick={() => handleDelete(rec._id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}


    </div>
  );
}
