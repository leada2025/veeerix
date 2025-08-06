import React, { useState, useEffect } from "react";
import axios from "../api/Axios";

const AdminTracklineUpdate = () => {
  const [submissions, setSubmissions] = useState([]);

  const statuses = [
    "Customer Approved",              // trackingStep 0
    "QC Approved",                    // trackingStep 1
    "Sent for Printing",             // trackingStep 2
    "Sent to Printer",               // postPrintStep 0
    "Under Printing",                // postPrintStep 1
    "Packing Material Dispatched",   // postPrintStep 2
    "In Transit",                    // postPrintStep 3
    "Received in Factory",           // postPrintStep 4
    "In Progress",                   // trackingStep 3
    "Despatched to Factory",         // trackingStep 4
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

  const handleStepUpdate = async (designId, newStatusIndex) => {
  try {
    if (newStatusIndex <= 2) {
      // Directly update trackingStep
      await axios.patch(`/packing/${designId}/step`, { step: newStatusIndex });
    } else if (newStatusIndex >= 3 && newStatusIndex <= 7) {
      // Post-print phase (including Received in Factory)
      const postPrintStep = newStatusIndex - 3;
      await axios.patch(`/packing/${designId}/post-print-step`, {
        step: postPrintStep,
      });
    } else if (newStatusIndex === 8 || newStatusIndex === 9) {
      // Final tracking steps: In Progress (3) or Despatched (4)
      const trackingStep = newStatusIndex - 5; // 8 → 3, 9 → 4
      await axios.patch(`/packing/${designId}/step`, { step: trackingStep });
    }

    fetchSubmissions(); // Refresh data
  } catch (err) {
    console.error("Failed to update step:", err);
  }
};


const getCurrentStatusIndex = (item) => {
  const { trackingStep, postPrintStep } = item;

  // First check for post-print steps
  if (trackingStep === 2 && postPrintStep != null) return postPrintStep + 3;
  if (trackingStep <= 2) return trackingStep;
  if (trackingStep === 3) return 8;
  if (trackingStep === 4) return 9;

  return 0;
};


  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold text-[#d1383a] mb-4">
        Packing Tracking Progress
      </h2>

      {submissions.map((item) => {
        const currentIndex = getCurrentStatusIndex(item);

        return (
          <div key={item._id} className="border p-4 mb-4 rounded">
            <p className="mb-2">
              <strong>Customer:</strong> {item.customerId?.name || "Unknown"}
            </p>

            <p>
              <strong>Current Step:</strong> {statuses[currentIndex]}
            </p>

            <select
              value={currentIndex}
              onChange={(e) =>
                handleStepUpdate(item._id, parseInt(e.target.value))
              }
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
