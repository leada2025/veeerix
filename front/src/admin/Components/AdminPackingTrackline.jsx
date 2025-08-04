import React, { useState, useEffect } from "react";
import axios from "../api/Axios";

const AdminTracklineUpdate = () => {
  const [submissions, setSubmissions] = useState([]);
  const statuses = [
    "Customer Approved",
    "QC Approved",
    "Sent for Printing",
    "In Progress",
    "Dispatched to Factory",
  ];

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get("/packing/submitted?mode=tracking");
      setSubmissions(res.data);
    } catch (err) {
      console.error("Error fetching submitted designs:", err);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleStepUpdate = async (designId, newStep) => {
    try {
      await axios.patch(`/packing/${designId}/step`, { step: newStep });
      fetchSubmissions(); // Refresh
    } catch (err) {
      console.error("Failed to update step:", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold text-[#d1383a] mb-4">
        Packing Tracking Progress
      </h2>

      {submissions.map((item) => {
        const step = Number.isInteger(item.trackingStep) ? item.trackingStep : 0;

        return (
          <div key={item._id} className="border p-4 mb-4 rounded">
            <p className="mb-2">
              <strong>Customer:</strong> {item.customerId?.name || "Unknown"}
            </p>

            <p>
              <strong>Current Step:</strong> {statuses[step]}
            </p>

            <select
              value={step}
              onChange={(e) => handleStepUpdate(item._id, parseInt(e.target.value))}
              className="mt-2 border p-2 rounded w-full"
            >
              {statuses.map((status, index) => (
                <option key={index} value={index}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
};

export default AdminTracklineUpdate;
