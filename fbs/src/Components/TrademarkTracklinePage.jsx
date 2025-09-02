import React, { useEffect, useState } from "react";
import axios from "../api/Axios";
import TrademarkStatusTracker from "./TrademarkStatusTracker";
import { useSource } from "../Context/SourceContext";
import { Loader2, Tag } from "lucide-react"; // icons for styling
import { motion } from "framer-motion";

const TrademarkTracklinePage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const { source } = useSource();
  const user = JSON.parse(localStorage.getItem("user"));
  const customerId = user?.id;

  const isFishman = source === "fishman";
  const primaryColor = isFishman ? "#7b4159" : "#d1383a";

  useEffect(() => {
    if (customerId) {
      fetchActiveSubmissions();
    }
  }, [customerId]);

  const fetchActiveSubmissions = async () => {
    try {
      const res = await axios.get(`/api/trademark/${customerId}`);
      setSubmissions(res.data || []);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="animate-spin text-gray-500 w-6 h-6" />
        <span className="ml-2 text-gray-600 text-sm">Loading tracking...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
      <h2
        className="text-3xl font-bold mb-8 text-center"
        style={{ color: primaryColor }}
      >
        Trademark Tracking
      </h2>

      {submissions.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-500 text-center text-base bg-gray-50 p-4 rounded-lg"
        >
          No active trademark tracking found. You may have completed your
          submissions or not started one yet.
        </motion.p>
      ) : (
        <div className="space-y-6">
          {submissions
            .filter((s) => !s.isDirect) // keep your filter logic
            .map((s, index) => (
              <motion.div
                key={s._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-gray-50 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Tag
                    size={18}
                    style={{ color: primaryColor }}
                    className="shrink-0"
                  />
                  <h3
                    className="text-lg font-semibold truncate"
                    style={{ color: primaryColor }}
                  >
                    {s.selectedName || "Pending Selection"}
                  </h3>
                </div>

                <TrademarkStatusTracker
                  currentStatus={s.trackingStatus}
                  highlightColor={primaryColor}
                />

                <p className="mt-4 text-sm text-gray-700">
                  Current Status:{" "}
                  <span
                    className="font-medium px-2 py-1 rounded-md"
                    style={{
                      backgroundColor: primaryColor + "20",
                      color: primaryColor,
                    }}
                  >
                    {s.trackingStatus}
                  </span>
                </p>
              </motion.div>
            ))}
        </div>
      )}
    </div>
  );
};

export default TrademarkTracklinePage;
