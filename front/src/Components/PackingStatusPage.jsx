import React, { useEffect, useState } from "react";
import axios from "../api/Axios";
import {
  CheckCircle,
  Clock,
  Printer,
  Truck,
  Package,
  ArrowDownCircle,
} from "lucide-react";

const stepLabels = [
  "Customer Approved",
  "QC Approved",
  "Sent for Printing",
  "In Progress",
  "Despatched to Factory",
];

const STATUS_STAGES = [
  { label: "Sent to Printer", icon: Printer },
  { label: "Under Printing", icon: Clock },
  { label: "Packing Material Dispatched", icon: Package },
  { label: "In Transit", icon: Truck },
  { label: "Received in Factory", icon: CheckCircle },
];

const UnifiedPackingStatus = ({ isPopup = false, submissionId = null }) => {
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
        let res;
        if (submissionId) {
          // 🔹 Submission-based
          res = await axios.get(`/packing/tracking/submission/${submissionId}`);
          setTrackings([res.data]); // wrap single entry in array
        } else if (customerId) {
          // 🔹 Customer-based
          res = await axios.get(`/packing/tracking/${customerId}`);
          setTrackings(res.data || []);
        }
      } catch (err) {
        console.error("Error fetching tracking:", err);
        setTrackings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
  }, [submissionId, customerId]);

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`max-w-5xl mx-auto ${isPopup ? "" : "mt-10"} p-6`}>
      {!isPopup && (
        <h2 className="text-3xl font-bold mb-8 text-[#d1383a] text-center">
          Packing Design Progress
        </h2>
      )}

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : trackings.length > 0 ? (
        [...trackings]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map((entry) => {
            const currentStep = entry.trackingStep ?? 0;
            const rawPostPrintStep =
              typeof entry?.postPrintStep === "number"
                ? entry.postPrintStep
                : -1;

            const forcedComplete = currentStep >= 3;
            const effectiveStep = currentStep;

            return (
              <div
                key={entry._id}
                className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
              >
                {/* Header Info */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-sm text-gray-600">
                      Submitted:{" "}
                      <span className="text-[#d1383a] font-medium">
                        {formatDateTime(entry.createdAt)}
                      </span>
                    </p>
                    {entry.updatedAt && (
                      <p className="text-sm text-gray-500">
                        Last Update:{" "}
                        <span className="text-blue-600 font-medium">
                          {formatDateTime(entry.updatedAt)}
                        </span>
                      </p>
                    )}
                  </div>
                  <span className="px-3 py-1 text-xs rounded-full bg-[#d1383a]/10 text-[#d1383a] font-semibold">
                    {stepLabels[effectiveStep]}
                  </span>
                </div>

                {/* Horizontal Step Progress */}
                <div className="relative flex items-center justify-between mb-6">
                  {stepLabels.map((label, index) => {
                    const isDone = effectiveStep > index;
                    const isCurrent = effectiveStep === index;

                    return (
                      <div
                        key={index}
                        className="flex-1 flex flex-col items-center text-center relative"
                      >
                        {index < stepLabels.length - 1 && (
                          <div
                            className={`absolute top-5 left-1/2 h-1 w-full ${
                              isDone ? "bg-[#d1383a]" : "bg-gray-200"
                            }`}
                          />
                        )}
                        <div
                          className={`w-10 h-10 flex items-center justify-center rounded-full border-2 z-10 ${
                            isDone || isCurrent
                              ? "bg-[#d1383a] border-[#d1383a] text-white"
                              : "bg-white border-gray-300 text-gray-400"
                          }`}
                        >
                          {isDone ? "✓" : index + 1}
                        </div>
                        <span
                          className={`mt-2 text-xs sm:text-sm ${
                            isDone || isCurrent
                              ? "text-[#d1383a] font-medium"
                              : "text-gray-400"
                          }`}
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Printing & Delivery Timeline */}
                {currentStep >= 2 && (
                  <div className="mt-4">
                    <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <ArrowDownCircle className="w-5 h-5 text-[#d1383a]" />
                      Printing & Delivery Status
                    </h4>
                    <div className="space-y-4 pl-2 border-l-2 border-gray-200">
                      {STATUS_STAGES.map((stage, index) => {
                        const Icon = stage.icon;
                        const isDone = forcedComplete
                          ? true
                          : rawPostPrintStep >= index;
                        const isCurrent = forcedComplete
                          ? false
                          : rawPostPrintStep === index;

                        return (
                          <div
                            key={index}
                            className={`flex items-start gap-3 ${
                              isDone
                                ? "text-[#d1383a]"
                                : isCurrent
                                ? "text-blue-600"
                                : "text-gray-400"
                            }`}
                          >
                            <div
                              className={`mt-1 w-6 h-6 flex items-center justify-center rounded-full border-2 ${
                                isDone
                                  ? "bg-[#d1383a] border-[#d1383a] text-white"
                                  : "border-gray-300"
                              }`}
                            >
                              {isDone ? "✓" : index + 1}
                            </div>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              <p className="text-sm font-medium">
                                {stage.label}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
      ) : (
        <p className="text-center text-gray-500">
          No active tracking entries found.
        </p>
      )}
    </div>
  );
};

export default UnifiedPackingStatus;
