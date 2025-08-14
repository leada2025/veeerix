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

  // Store viewed submission timestamps
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
    // Update viewed timestamp
    const updatedViewed = {
      ...viewedTimestamps,
      [sub._id]: sub.updatedAt || new Date().toISOString(),
    };
    setViewedTimestamps(updatedViewed);
    localStorage.setItem("viewedTimestamps", JSON.stringify(updatedViewed));

    // Navigate with correct ID
    navigate(`/requests/${sub._id}`);
  };

  if (loading) return <div className="p-4">Loading...</div>;



  return (
    <div className="max-w-7xl mx-auto mt-10 px-4">
    {/* Header */}
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold" style={{ color: primaryColor }}>
        Trademark Requests
      </h2>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center px-4 py-2 text-white rounded-lg shadow transition"
        style={{ backgroundColor: primaryColor }}
      >
        <PlusCircle className="mr-2" size={18} /> New Request
      </button>
    </div>

    {/* Requests Grid */}
    {submissions.length === 0 ? (
      <div className="p-4 text-center text-gray-500">
        No trademark requests found.
      </div>
    ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              className={`p-5 border rounded-lg shadow-sm hover:shadow-md transition relative ${
                updatedRecently ? "ring-2 ring-[#7b4159]" : ""
              }`}
              style={{ backgroundColor: "#fff" }}
            >
              {updatedRecently && (
                <span className="absolute top-3 right-3 bg-[#7b4159] text-white text-xs px-2 py-1 rounded animate-pulse">
                  Updated
                </span>
              )}

              <h3 className="text-lg font-semibold" style={{ color: primaryColor }}>
                Request #{index + 1}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Status:{" "}
                <span
                  className={`font-medium ${
                    isComplete ? "text-green-600" : "text-yellow-600"
                  }`}
                >
                  {isComplete ? "Completed" : "In Progress"}
                </span>
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Last Updated: {dayjs(sub.updatedAt).format("MMM D, YYYY h:mm A")}
              </p>

              <button
                onClick={() => handleViewDetails(sub)}
                className="mt-4 w-full text-white py-2 rounded-md transition"
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
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4" style={{ color: primaryColor }}>
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
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
                style={{ borderColor: primaryColor }}
              />
            ))}
            <div className="flex space-x-2 pt-2">
              <button
                type="submit"
                className="flex-1 text-white py-2 rounded"
                style={{ backgroundColor: primaryColor }}
              >
                Submit
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 text-white py-2 rounded"
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
