// src/pages/CustomerDirectTrademarkPage.jsx
import React, { useEffect, useState } from "react";
import axios from "../api/Axios";
import { PlusCircle, Loader2, Award } from "lucide-react";
import { motion } from "framer-motion";

const CustomerDirectTrademarkPage = () => {
  const [finalizedTrademarks, setFinalizedTrademarks] = useState([]);
  const [newTrademark, setNewTrademark] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const customerId = user?.id;

  useEffect(() => {
    if (customerId) {
      fetchFinalized();
    }
  }, [customerId]);

  const fetchFinalized = async () => {
    try {
      const res = await axios.get(`/api/trademark/finalized/${customerId}`);
      setFinalizedTrademarks(res.data || []);
    } catch (err) {
      console.error("Failed to fetch finalized trademarks", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrademark = async (e) => {
    e.preventDefault();
    if (!newTrademark.trim()) return;
    setAdding(true);

    try {
      await axios.post("/api/trademark/direct", {
        customerId,
        name: newTrademark.trim(),
      });

      setNewTrademark("");
      fetchFinalized();
    } catch (err) {
      console.error("Failed to add new trademark", err);
      alert("Failed to add trademark.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 mt-10">
      <h2 className="text-3xl font-bold text-[#7b4159] mb-8 border-b-2 border-gray-200 pb-3">
        My Registered Trademarks
      </h2>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-[#7b4159]" size={32} />
          <span className="ml-3 text-gray-600 text-lg">Loading...</span>
        </div>
      ) : (
        <>
          {/* Empty state */}
          {finalizedTrademarks.length === 0 ? (
            <div className="text-center text-gray-500 py-16">
              <Award size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-xl font-medium mb-2">
                No finalized trademarks yet
              </p>
              <p className="text-gray-500">
                Once you register, your trademarks will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
              {finalizedTrademarks.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Award className="text-[#7b4159]" size={24} />
                    <p className="text-lg font-semibold text-gray-800">
                      {item.selectedName}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Add new trademark */}
          <form
            onSubmit={handleAddTrademark}
            className="flex gap-3 items-center mt-6"
          >
            <input
              type="text"
              placeholder="Enter new registered trademark"
              className="border border-gray-300 px-4 py-3 rounded-xl w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7b4159]"
              value={newTrademark}
              onChange={(e) => setNewTrademark(e.target.value)}
            />
            <button
              type="submit"
              disabled={adding}
              className="flex items-center gap-2 bg-[#7b4159] text-white px-5 py-3 rounded-xl font-medium hover:bg-[#69384d] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <PlusCircle size={18} />
              )}
              {adding ? "Adding..." : "Add"}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default CustomerDirectTrademarkPage;
