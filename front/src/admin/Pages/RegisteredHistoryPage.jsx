import React, { useEffect, useState } from "react";
import axios from "../api/Axios";

const RegisteredHistoryPage = () => {
  const [registered, setRegistered] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistered = async () => {
      try {
        const res = await axios.get("/api/trademark/finalized");
        const filtered =
          res.data?.filter((item) => item.trackingStatus === "Registered") || [];
        setRegistered(filtered);
      } catch (err) {
        console.error("Failed to fetch registered trademarks", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistered();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ✅ Updated primary color */}
      <h1 className="text-2xl font-bold text-[#7b4159] mb-6">
        Registered Trademark History
      </h1>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : registered.length === 0 ? (
        <div className="text-gray-400">No registered trademarks found.</div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-xl shadow bg-white">
          <table className="min-w-full text-sm text-left border-separate border-spacing-y-2">
            {/* ✅ Updated header color */}
            <thead className="bg-[#f4e9ed] text-[#7b4159] text-sm font-semibold uppercase">
              <tr>
                <th className="p-3">Customer</th>
                <th className="p-3">Final Name</th>
                <th className="p-3">Remarks</th>
                <th className="p-3">Registered On</th>
                <th className="p-3">Source</th>
              </tr>
            </thead>
            <tbody>
              {registered.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="p-3">
                    {item.customerId?.name ||
                      item.customerId?.email ||
                      "N/A"}
                  </td>
                  <td className="p-3 font-medium text-green-700">
                    {item.selectedName || "—"}
                  </td>
                  <td className="p-3">{item.remark || "—"}</td>
                  <td className="p-3">
                    {new Date(item.updatedAt).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="p-3">
                    {item.isDirect ? (
                      <span className="text-blue-600 font-semibold">
                        Customer Direct Entry
                      </span>
                    ) : (
                      <span className="text-gray-700">Platform Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RegisteredHistoryPage;
