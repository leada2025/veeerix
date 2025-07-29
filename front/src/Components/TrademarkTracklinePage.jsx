import React, { useEffect, useState } from "react";
import axios from "../api/Axios";
import TrademarkStatusTracker from "./TrademarkStatusTracker";
import { useSource } from "../Context/SourceContext";

const TrademarkTracklinePage = () => {
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clearedIds, setClearedIds] = useState([]);

  

  const { source } = useSource();
  const user = JSON.parse(localStorage.getItem("user"));
  const customerId = user?.id;

  const isFishman = source === "fishman";
  const primaryColor = isFishman ? "#7b4159" : "#d1383a";

  useEffect(() => {
    if (customerId) {
      fetchActiveSubmission();
    }
  }, [customerId]);
const fetchActiveSubmission = async () => {
  try {
    const res = await axios.get(`/api/trademark/${customerId}`);
    setSubmission(res.data); // <- show all submissions
  } catch (err) {
    console.error("Error fetching submissions:", err);
  } finally {
    setLoading(false);
  }
};

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-md shadow">
      <h2 className="text-2xl font-bold mb-6" style={{ color: primaryColor }}>
        Trademark Tracking
      </h2>

     {submission.length === 0 ? (
  <p className="text-gray-500 text-sm">
    No active trademark tracking found. You may have completed your submissions or not started one yet.
  </p>
) : (
 submission
  .filter((s) => !clearedIds.includes(s._id))
  .map((s) => (
    <div key={s._id} className="mb-6 p-4 border rounded-md bg-gray-50 shadow-sm">
      <h3 className="text-lg font-semibold mb-2" style={{ color: primaryColor }}>
        Tracking: {s.selectedName || "Pending Selection"}
      </h3>

      <TrademarkStatusTracker
        currentStatus={s.trackingStatus}
        highlightColor={primaryColor}
      />

      <p className="mt-3 text-sm text-gray-600">
        Current Status:{" "}
        <span className="font-medium" style={{ color: primaryColor }}>
          {s.trackingStatus}
        </span>
      </p>

      <button
        onClick={() => setClearedIds((prev) => [...prev, s._id])}
        className="mt-3 text-xs text-red-500 hover:underline"
      >
        Clear from list
      </button>
    </div>
))

)}

    </div>
  );
};

export default TrademarkTracklinePage;
