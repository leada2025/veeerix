import React from "react";

const steps = [
  "Customer Approved",
  "QC Approved",
  "Sent for Printing",
  "In Progress",
  "Despatched to Factory",
];

const PackingApprovalTracker = ({ currentStep }) => {
  const currentIndex = steps.findIndex(step => step === currentStep);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-[#d1383a] mb-2">Current Status</h3>
      <div className="flex justify-between relative">
        {steps.map((step, idx) => (
          <div key={idx} className="flex-1 text-center relative">
            <div className={`w-4 h-4 mx-auto rounded-full ${idx <= currentIndex ? "bg-[#d1383a]" : "bg-gray-300"}`} />
            <p className={`text-xs mt-2 ${idx <= currentIndex ? "text-[#d1383a]" : "text-gray-400"}`}>{step}</p>
          </div>
        ))}
        <div className="absolute top-2 left-2 right-2 h-1 bg-gray-300 z-0" />
        <div
          className="absolute top-2 left-2 h-1 bg-[#d1383a] z-10 transition-all duration-500"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default PackingApprovalTracker;
