import React, { useEffect, useState } from "react";
import axios from "../api/Axios";
import { useSource } from "../Context/SourceContext";
import { useNavigate } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import dayjs from "dayjs";

const CustomerPortal = () => {
  const [suggestedNames, setSuggestedNames] = useState(["", "", "", "", ""]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { source } = useSource();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const customerId = user?.id;
  const primaryColor = source === "fishman" ? "#7b4159" : "#d1383a";

  // Viewed timestamps
  const [viewedTimestamps, setViewedTimestamps] = useState(
    JSON.parse(localStorage.getItem("viewedTimestamps")) || {}
  );

  useEffect(() => {
    if (customerId) fetchSubmissions();
  }, [customerId]);

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get(`/api/trademark/${customerId}`);
      setSubmissions(res.data || []);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index, value) => {
    const updated = [...suggestedNames];
    updated[index] = value;
    setSuggestedNames(updated);
  };

  const handleSubmitNames = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/trademark", {
        customerId,
        suggestions: suggestedNames,
      });
      setSuggestedNames(["", "", "", "", ""]);
      setShowModal(false);
      fetchSubmissions();
    } catch (err) {
      alert("Submission failed.");
    }
  };

  const isRecentlyUpdated = (sub) => {
    if (!sub.updatedAt) return false;
    const lastViewed = viewedTimestamps[sub._id];
    const adminFields = [
      sub.suggestedToCustomer?.length > 0,
      sub.rejectedNames?.length > 0,
      sub.paymentCompleted,
      !!sub.adminDocumentUrl,
      !!sub.customerSignedDocUrl,
    ];
    return (
      adminFields.some(Boolean) &&
      dayjs().diff(dayjs(sub.updatedAt), "hour") <= 24 &&
      (!lastViewed || dayjs(sub.updatedAt).isAfter(dayjs(lastViewed)))
    );
  };

  const handleViewDetails = (sub) => {
    const updatedViewed = {
      ...viewedTimestamps,
      [sub._id]: sub.updatedAt || new Date().toISOString(),
    };
    setViewedTimestamps(updatedViewed);
    localStorage.setItem("viewedTimestamps", JSON.stringify(updatedViewed));
    navigate(`/requests/${sub._id}`);
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2
          className="text-2xl font-bold"
          style={{ color: primaryColor }}
        >
          Trademark Requests
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-5 py-2 text-white rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 hover:scale-105"
          style={{ backgroundColor: primaryColor }}
        >
          <PlusCircle className="mr-2" size={20} /> New Request
        </button>
      </div>

      {/* Requests Grid */}
      {submissions.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No trademark requests found.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {submissions.map((sub, index) => {
            const completedStages = [
              sub.suggestions?.length > 0,
              !!sub.selectedName,
              !!sub.paymentCompleted,
              !!sub.adminDocumentUrl,
              !!sub.customerSignedDocUrl,
            ].filter(Boolean).length;
            const isComplete = completedStages === 5;
            const updatedRecently = isRecentlyUpdated(sub);

            return (
              <div
                key={sub._id}
                className={`relative p-6 rounded-2xl shadow-lg transform transition-all hover:scale-105 hover:shadow-2xl`}
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}20, #fff)`,
                  border: `2px solid ${primaryColor}`,
                }}
              >
                {updatedRecently && (
                  <span
                    className="absolute top-3 right-3 px-2 py-1 text-xs font-semibold text-white rounded-full animate-pulse"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Updated
                  </span>
                )}

                <h3 className="text-lg font-semibold mb-2" style={{ color: primaryColor }}>
                  Request #{index + 1}
                </h3>
                <p className="text-sm text-gray-700 mb-2">
                  Status:{" "}
                  <span
                    className={`font-medium ${
                      isComplete ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    {isComplete ? "Completed" : "In Progress"}
                  </span>
                </p>
                
                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${(completedStages / 5) * 100}%`,
                      backgroundColor: primaryColor,
                      transition: "width 0.5s ease-in-out",
                    }}
                  ></div>
                </div>

                <p className="text-xs text-gray-500 mb-4">
                  Last Updated: {dayjs(sub.updatedAt).format("MMM D, YYYY h:mm A")}
                </p>

                <button
                  onClick={() => handleViewDetails(sub)}
                  className="w-full py-2 rounded-lg text-white font-medium transition-transform transform hover:scale-105"
                  style={{ backgroundColor: primaryColor }}
                >
                  View Details
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md animate-fade-in">
            <h3
              className="text-lg font-semibold mb-4 text-center"
              style={{ color: primaryColor }}
            >
              Suggest Brand Names
            </h3>
            <form onSubmit={handleSubmitNames} className="space-y-3">
              {suggestedNames.map((name, index) => (
                <input
                  key={index}
                  type="text"
                  value={name}
                  onChange={(e) => handleChange(index, e.target.value)}
                  placeholder={`Brand Name ${index + 1}`}
                  required={index === 0}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ borderColor: primaryColor }}
                />
              ))}
              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 text-white font-semibold rounded-lg transition-transform transform hover:scale-105"
                  style={{ backgroundColor: primaryColor }}
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 text-white font-semibold rounded-lg transition-transform transform hover:scale-105"
                  style={{ backgroundColor: primaryColor }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPortal;
