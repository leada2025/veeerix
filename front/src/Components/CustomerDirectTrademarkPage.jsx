import React, { useEffect, useState } from "react";
import axios from "../api/Axios";
import { PlusCircle } from "lucide-react";

const CustomerDirectTrademarkPage = () => {
  const [finalizedTrademarks, setFinalizedTrademarks] = useState([]);
  const [newTrademark, setNewTrademark] = useState("");
  const [loading, setLoading] = useState(true);
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
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      <h2 className="text-3xl font-semibold text-[#7b4159] mb-8 border-b pb-2">
        My Registered Trademarks
      </h2>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          {finalizedTrademarks.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              <p className="text-lg">No finalized trademarks yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {finalizedTrademarks.map((item) => (
                <div
                  key={item._id}
                  className="bg-white shadow-sm border border-gray-200 rounded-xl p-4 text-[#333] hover:shadow-md transition"
                >
                  <p className="text-lg font-medium">{item.selectedName}</p>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleAddTrademark} className="flex gap-3 items-center">
            <input
              type="text"
              placeholder="Enter new registered trademark"
              className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#7b4159]"
              value={newTrademark}
              onChange={(e) => setNewTrademark(e.target.value)}
            />
            <button
              type="submit"
              className="flex items-center gap-2 bg-[#7b4159] text-white px-4 py-2 rounded-lg hover:bg-[#69384d] transition"
            >
              <PlusCircle size={18} />
              Add
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default CustomerDirectTrademarkPage;
