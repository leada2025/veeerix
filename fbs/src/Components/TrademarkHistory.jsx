// src/pages/TrademarkHistory.jsx
import React, { useEffect, useState } from "react";
import axios from "../api/Axios";
import { useSource } from "../Context/SourceContext";
import { Clock, CheckCircle2, FileText } from "lucide-react";

const TrademarkHistory = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const { source } = useSource();
  const user = JSON.parse(localStorage.getItem("user"));
  const customerId = user?.id;

  const primaryColor = source === "fishman" ? "#7b4159" : "#d1383a";

  useEffect(() => {
    if (customerId) {
      axios
        .get(`/api/trademark/${customerId}`)
        .then((res) => {
          const filtered = (res.data || []).filter(
            (s) => s.selectedName && s.suggestions.length > 1
          );
          setSubmissions(filtered);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch history", err);
          setLoading(false);
        });
    }
  }, [customerId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gray-400"></div>
        <span className="ml-3 text-gray-600 text-sm">Loading history...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h2
        className="text-3xl font-extrabold tracking-tight mb-10 text-center"
        style={{ color: primaryColor }}
      >
        Trademark History
      </h2>

      {submissions.length === 0 ? (
        <div className="text-center text-gray-500 text-lg">
          No trademark history found.
        </div>
      ) : (
        <div className="relative border-l border-gray-300 pl-6 space-y-8">
          {submissions.map((s, idx) => (
            <div
              key={s._id}
              className="relative bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200"
            >
              {/* Timeline Dot */}
              <div
                className="absolute -left-3 top-6 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
                style={{ backgroundColor: primaryColor }}
              >
                <CheckCircle2 size={16} className="text-white" />
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                <div className="flex items-center text-gray-600 text-sm">
                  <Clock className="w-4 h-4 mr-2" />
                  Submitted on{" "}
                  <span className="ml-1 font-medium text-gray-800">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div
                  className="mt-2 sm:mt-0 text-sm font-semibold px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: `${primaryColor}15`,
                    color: primaryColor,
                  }}
                >
                  {s.trackingStatus}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="font-medium mr-1" style={{ color: primaryColor }}>
                    Names:
                  </span>
                  <span className="text-gray-700">
                    {s.suggestions?.map((n) => n.name).join(", ")}
                  </span>
                </div>

                {s.selectedName && (
                  <div className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                    <span className="font-medium mr-1" style={{ color: primaryColor }}>
                      Selected:
                    </span>
                    <span className="text-gray-700">{s.selectedName}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrademarkHistory;
