import React from "react";

const STATUS_STAGES = [
  "Sent to Printer",
  "Under Printing",
  "Packing Material Dispatched",
  "In Transit",
  "Received in Factory",
];

// Sample static data
const staticEntries = [
  {
    _id: "1",
    customerName: "ACME Corp",
    productName: "Box Pack A",
    currentStatus: "Packing Material Dispatched",
  },
  {
    _id: "2",
    customerName: "Beta Ltd",
    productName: "Bottle Label",
    currentStatus: "In Transit",
  },
  {
    _id: "3",
    customerName: "Gamma Pvt",
    productName: "Pouch Film",
    currentStatus: "Sent to Printer",
  },
];

const StatusTracker = () => {
  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold text-[#d1383a] mb-6">
        Packing Status Tracker
      </h2>

      {staticEntries.map((entry) => (
        <div
          key={entry._id}
          className="mb-8 border p-4 rounded shadow-sm bg-gray-50"
        >
          <p className="text-sm font-medium text-gray-700 mb-2">
            Customer: {entry.customerName}
          </p>

          <p className="text-sm mb-2 text-gray-600">
            Product: {entry.productName}
          </p>

          <div className="flex flex-col gap-3">
            {STATUS_STAGES.map((stage, index) => {
              const isDone =
                STATUS_STAGES.indexOf(entry.currentStatus) >= index;
              return (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      isDone
                        ? "bg-[#d1383a] border-[#d1383a]"
                        : "bg-white border-gray-400"
                    }`}
                  ></div>
                  <span
                    className={`text-sm ${
                      isDone
                        ? "text-[#d1383a] font-semibold"
                        : "text-gray-500"
                    }`}
                  >
                    {stage}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatusTracker;
