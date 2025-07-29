import React, { useEffect, useState } from "react";
import axios from "../api/Axios";
import PackingApprovalTracker from "./PackingApprovalTracker";

const stepLabels = [
  "Customer Approved",
  "QC Approved",
  "Sent for Printing",
  "In Progress",
  "Despatched to Factory",
];

const PackingStatusPage = () => {
  const [trackings, setTrackings] = useState([]);
  const [loading, setLoading] = useState(true);

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {}
  const customerId = user?.id;

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const res = await axios.get(`/packing/tracking/${customerId}`);
        setTrackings(res.data); // All approved designs
      } catch (err) {
        console.error("Tracking fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    if (customerId) fetchTracking();
  }, [customerId]);

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-6 text-[#d1383a]">Packing Design Progress</h2>
      {loading ? (
        <p>Loading...</p>
      ) : trackings.length > 0 ? (
        trackings.map((entry, index) => (
          <div key={entry._id} className="mb-8">
            <h3 className="font-semibold text-gray-700 mb-2">
              Cycle {index + 1} – Submitted on {new Date(entry.createdAt).toLocaleDateString()}
            </h3>
            <PackingApprovalTracker currentStep={stepLabels[entry.trackingStep ?? 0]} />
          </div>
        ))
      ) : (
        <p className="text-gray-600">No active tracking entries found.</p>
      )}
    </div>
  );
};

export default PackingStatusPage;
