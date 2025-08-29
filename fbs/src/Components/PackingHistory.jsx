// src/pages/PackingHistory.jsx
import React, { useEffect, useState } from "react";
import axios from "../admin/api/Axios";
import { BASE_URL } from "../api/config";

const PackingHistory = () => {
  const [history, setHistory] = useState([]);
 

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {}
  const customerId = user?.id;

  useEffect(() => {
    if (!customerId) return;

    const fetchHistory = async () => {
      try {
        const res = await axios.get(`/packing/history/${customerId}`);
        setHistory(res.data);
      } catch (err) {
        console.error("Failed to load history:", err);
      }
    };

    fetchHistory();
  }, [customerId]);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-6 text-[#d1383a]">Packing Design History</h2>

      {history.length === 0 ? (
        <p className="text-gray-500">No history found.</p>
      ) : (
        <div className="space-y-4">
          {history.map((entry) => (
            <div key={entry._id} className="p-4 border rounded bg-gray-50">
              <p><strong>Status:</strong> {entry.status}</p>
              <p><strong>Submitted:</strong> {new Date(entry.createdAt).toLocaleString()}</p>
              {entry.finalDesignUrl && (
                <img
                  src={`${BASE_URL}/${entry.finalDesignUrl.replace(/^\/?uploads\/?/, "uploads/")}`}
                  alt="Final Design"
                  className="w-40 mt-2 rounded"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PackingHistory;
