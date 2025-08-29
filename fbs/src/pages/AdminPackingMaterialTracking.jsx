import React, { useState, useEffect } from "react";
import axios from "../api/Axios";

const STATUS_STAGES = [
  "Sent to Printer",
  "Under Printing",
  "Packing Material Dispatched",
  "In Transit",
  "Received in Factory",
];

const PackingStatusTracker = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/packing/post-print-tracking");
        setEntries(res.data);
      } catch (err) {
        console.error("Error fetching post-printing data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-[#d1383a] mb-6">
        Your Packing Design Status
      </h2>

      {loading ? (
        <p className="text-gray-500">Loading status...</p>
      ) : entries.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          <p>No designs are currently in tracking.</p>
          <p className="text-sm mt-2">We’ll update your tracking status here once your design is sent for printing.</p>
        </div>
      ) : (
        entries.map((entry) => {
          const currentStep = entry.postPrintStep ?? 0;

          return (
            <div
              key={entry._id}
              className="mb-10 border rounded-md p-5 bg-gray-50 shadow-sm"
            >
              <p className="text-lg font-medium text-gray-800 mb-4">
                Design: <span className="text-[#d1383a]">{entry.designName || entry.productName}</span>
              </p>

              <div className="ml-3">
                {STATUS_STAGES.map((stage, index) => {
                  const isDone = currentStep >= index;
                  const isCurrent = currentStep === index;
                  const isFinal = index === STATUS_STAGES.length - 1;

                  return (
                    <div key={index} className="flex items-center gap-3 relative mb-3">
                      {/* Vertical Line */}
                      {index < STATUS_STAGES.length - 1 && (
                        <div
                          className={`absolute left-2 top-6 h-5 w-0.5 ${
                            isDone ? "bg-[#d1383a]" : "bg-gray-300"
                          }`}
                          style={{ zIndex: -1 }}
                        />
                      )}

                      {/* Status Circle */}
                      <div
                        className={`w-5 h-5 flex items-center justify-center rounded-full border-2 ${
                          isDone
                            ? "bg-[#d1383a] border-[#d1383a] text-white"
                            : "bg-white border-gray-400 text-transparent"
                        }`}
                      >
                        {isFinal && isDone ? "✓" : "•"}
                      </div>

                      {/* Status Label */}
                      <span
                        className={`text-sm ${
                          isDone
                            ? "text-[#d1383a] font-semibold"
                            : "text-gray-500"
                        } ${isCurrent ? "underline" : ""}`}
                      >
                        {stage}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default PackingStatusTracker;
