import React from "react";
import { CheckCircle } from "lucide-react"; // ✅ lucide-react for check icon

const steps = [
  "Customer Approved",
  "QC Approved",
  "Sent for Printing",
  "In Progress",
  "Despatched to Factory",
];

const PackingApprovalTracker = ({ currentStep }) => {
  const currentIndex = steps.findIndex((step) => step === currentStep);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-[#d1383a] mb-2">Current Status</h3>

      <div className="relative flex justify-between items-center">
        {/* Connector Line - Background */}
        <div className="absolute top-2 left-0 right-0 h-1 bg-gray-300 z-0" />

        {/* Connector Line - Progress */}
        <div
          className="absolute top-2 left-0 h-1 bg-[#d1383a] z-10 transition-all duration-500"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => (
          <div key={idx} className="flex-1 text-center relative z-20">
            {/* Step Dot or Check Icon */}
            {idx === steps.length - 1 && idx <= currentIndex ? (
              <CheckCircle className="w-5 h-5 mx-auto text-green-600" />
            ) : (
              <div
                className={`w-4 h-4 mx-auto rounded-full border-2 ${
                  idx <= currentIndex
                    ? "bg-[#d1383a] border-[#d1383a]"
                    : "bg-white border-gray-400"
                }`}
              />
            )}

            {/* Step Label */}
            <p
              className={`text-xs mt-2 ${
                idx <= currentIndex ? "text-[#d1383a]" : "text-gray-400"
              }`}
            >
              {step}
            </p>

            {/* Subtext for "Sent for Printing" step */}
            {step === "Sent for Printing" && idx === currentIndex && (
              <p className="text-[10px] text-blue-500 mt-1 italic">
                Check packing material status
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PackingApprovalTracker;
