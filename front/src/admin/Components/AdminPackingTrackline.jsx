import React, { useState, useEffect } from "react";
import axios from "../api/Axios";

const AdminTracklineUpdate = () => {
  const [submissions, setSubmissions] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const statuses = [
    "Customer Approved",
    "QC Approved",
    "Sent for Printing",
    "Sent to Printer",
    "Under Printing",
    "Packing Material Dispatched",
    "In Transit",
    "Received in Factory",
    "In Progress",
    "Despatched to Factory",
  ];

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get("/packing/submitted?mode=tracking");
      setSubmissions(res.data);
    } catch (err) {
      console.error("Error fetching submitted designs:", err);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleStepUpdate = async (designId, newStatusIndex) => {
    try {
      if (newStatusIndex < 2) {
        await axios.patch(`/packing/${designId}/step`, { step: newStatusIndex });
      } else if (newStatusIndex === 2) {
        await axios.patch(`/packing/${designId}/step`, { step: 2 });
        await axios.patch(`/packing/${designId}/post-print-step`, { step: 0 });
      } else if (newStatusIndex >= 3 && newStatusIndex <= 7) {
        const postPrintStep = newStatusIndex - 3;
        await axios.patch(`/packing/${designId}/post-print-step`, { step: postPrintStep });
      } else if (newStatusIndex === 8 || newStatusIndex === 9) {
        const trackingStep = newStatusIndex - 5;
        await axios.patch(`/packing/${designId}/step`, { step: trackingStep });
      }
      fetchSubmissions();
    } catch (err) {
      console.error("Failed to update step:", err);
    }
  };

  const getCurrentStatusIndex = (item) => {
    const { trackingStep, postPrintStep } = item;
    if (trackingStep === 2 && postPrintStep != null) return postPrintStep + 3;
    if (trackingStep <= 2) return trackingStep;
    if (trackingStep === 3) return 8;
    if (trackingStep === 4) return 9;
    return 0;
  };

  const filteredSubmissions = submissions.filter((item) => {
    const searchLower = search.toLowerCase();
    return (
      item.customerId?.name?.toLowerCase().includes(searchLower) ||
      item.trademarkName?.toLowerCase().includes(searchLower) ||
      item.moleculeName?.toLowerCase().includes(searchLower)
    );
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentSubmissions = filteredSubmissions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4">
      <h2 className="text-3xl font-bold text-[#d1383a] mb-6 text-center">
        Packing Tracking Progress
      </h2>

      {/* Search Box */}
      <div className="mb-6 flex justify-center">
        <input
          type="text"
          placeholder="Search by customer, trademark, or molecule..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full md:w-1/2 border-none shadow-lg p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-[#d1383a] placeholder-gray-400"
        />
      </div>

      {/* Submissions Grid */}
      {currentSubmissions.length === 0 ? (
        <p className="text-center text-gray-500">No submissions found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentSubmissions.map((item) => {
            const currentIndex = getCurrentStatusIndex(item);
            const currentStatus = statuses[currentIndex];

            return (
              <div
                key={item._id}
                className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-xl p-6 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border-l-4 border-[#d1383a]"
              >
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-gray-500">
                    <strong>Customer:</strong> {item.customerId?.name || "Unknown"}
                  </p>
                  <p className="text-sm text-gray-400 italic">
                    Submitted: {new Date(item.createdAt).toLocaleString()}
                  </p>

                  <p className="text-lg font-semibold text-[#d1383a] mt-2">
                    Trademark: {item.trademarkName || "N/A"}
                  </p>
                  <p className="text-lg font-semibold text-[#d1383a]">
                    Molecule: {item.moleculeName || "N/A"}
                  </p>

                  <p className="mt-3">
                    <strong>Current Step:</strong>{" "}
                    <span className="text-blue-600 font-medium">{currentStatus}</span>
                  </p>

                  <select
                    value={currentIndex}
                    onChange={(e) => handleStepUpdate(item._id, parseInt(e.target.value))}
                    className="mt-3 border-none rounded-lg p-2 w-full shadow focus:outline-none focus:ring-2 focus:ring-[#d1383a]"
                  >
                    {statuses.map((status, index) => (
                      <option key={index} value={index}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-3">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded-full ${
                currentPage === i + 1
                  ? "bg-[#d1383a] text-white shadow-lg"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminTracklineUpdate;
