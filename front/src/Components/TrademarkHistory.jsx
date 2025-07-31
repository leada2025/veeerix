// src/pages/TrademarkHistory.jsx
import React, { useEffect, useState } from "react";
import axios from "../api/Axios";
import { useSource } from "../Context/SourceContext";

const TrademarkHistory = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const { source } = useSource();
  const user = JSON.parse(localStorage.getItem("user"));
  const customerId = user?.id;

  const primaryColor = source === "fishman" ? "#7b4159" : "#d1383a";

  useEffect(() => {
    if (customerId) {
      axios.get(`/api/trademark/${customerId}`).then((res) => {
        const filtered = (res.data || []).filter(
  (s) => s.selectedName && s.suggestions.length > 1
);
setSubmissions(filtered);

        setLoading(false);
      }).catch((err) => {
        console.error("Failed to fetch history", err);
        setLoading(false);
      });
    }
  }, [customerId]);

  if (loading) return <div className="p-4">Loading history...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6" style={{ color: primaryColor }}>
        Trademark History
      </h2>

      {submissions.length === 0 ? (
        <p className="text-gray-500">No trademark history found.</p>
      ) : (
        <ul className="space-y-4">
          {submissions.map((s) => (
            <li
              key={s._id}
              className="p-5 bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium" style={{ color: primaryColor }}>
                  Submitted:
                </span>{" "}
                {new Date(s.createdAt).toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium" style={{ color: primaryColor }}>
                  Status:
                </span>{" "}
                {s.trackingStatus}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium" style={{ color: primaryColor }}>
                  Names:
                </span>{" "}
                {s.suggestions?.map((n) => n.name).join(", ")}
              </div>
              {s.selectedName && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium" style={{ color: primaryColor }}>
                    Selected:
                  </span>{" "}
                  {s.selectedName}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TrademarkHistory;
