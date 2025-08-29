import React from "react";

const STAGES = [
  "New TM Application",
  "Send to Vienna Codification",
  "Formalities Check Pass",
  "Marked for Exam",
  "Examination Report Issued",
  "Accepted and Advertised",
  "Registered",
];

const TrademarkStatusTracker = ({ currentStatus, highlightColor = "#d1383a" }) => {
  const currentIndex = STAGES.findIndex(stage => stage === currentStatus);

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center relative">
        {STAGES.map((stage, index) => (
          <div key={stage} className="flex-1 text-center">
            <div
              className={`w-4 h-4 rounded-full mx-auto ${
                index <= currentIndex ? "" : "bg-gray-300"
              }`}
              style={{ backgroundColor: index <= currentIndex ? highlightColor : "#ccc" }}
            />
            <p
              className={`text-[11px] mt-2`}
              style={{ color: index <= currentIndex ? highlightColor : "#999" }}
            >
              {stage}
            </p>
          </div>
        ))}
        <div className="absolute top-2 left-2 right-2 h-1 bg-gray-300 z-0" />
        <div
          className="absolute top-2 left-2 h-1 z-10 transition-all duration-500"
          style={{
            width: `${(currentIndex / (STAGES.length - 1)) * 100}%`,
            backgroundColor: highlightColor,
          }}
        />
      </div>
    </div>
  );
};

export default TrademarkStatusTracker;
