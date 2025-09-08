import React, { useEffect, useState } from "react";
import axios from "../api/Axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  CheckCircle,
  ClipboardList,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const orderSteps = [
  "Brand Name Submitted",
  "Payment Confirmed",
  "Packing Design",
  "Raw Material",
  "Under Production",
  "Under Packing",
  "Under Testing",
  "Dispatched",
  "In Transit",
  "Received at Distribution Centre",
  "Delivered to Client",
];

const PlaceOrderWithTracking = () => {
  const [brands, setBrands] = useState([]);
  const [molecules, setMolecules] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedMolecule, setSelectedMolecule] = useState("");
  const [quantity, setQuantity] = useState("");
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const user = JSON.parse(localStorage.getItem("user"));
  const customerId = user?.id;

  // Fetch options
 // Fetch trademarks instead of options
// Fetch trademarks for this customer only
useEffect(() => {
  const fetchTrademarks = async () => {
    try {
      if (customerId) {
        const res = await axios.get(`/orders/trademarks/${customerId}`);
        setBrands(res.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch trademarks", err);
    }
  };
  fetchTrademarks();
}, [customerId]);


  // Fetch orders
  const fetchOrders = async () => {
    try {
      const res = await axios.get(`/orders/customer/${customerId}`);
      setOrders(res.data || []);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    }
  };

  useEffect(() => {
    if (customerId) fetchOrders();
  }, [customerId]);

  // Submit new order
  const handleSubmit = async () => {
    if (!selectedBrand || !selectedMolecule || !quantity) {
      setError("Please select brand, molecule, and enter quantity.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await axios.post("/orders/from-trademark", {
      customerId: user.id,
        brandName: selectedBrand,
        moleculeName: selectedMolecule,
        quantity,
      });
      await fetchOrders();
      setSelectedBrand("");
      setSelectedMolecule("");
      setQuantity("");
    } catch (err) {
      console.error("Order creation failed", err);
      setError(err?.response?.data?.error || "Order creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-10 p-6 max-w-7xl mx-auto">
      {/* Orders List */}
      <div className="flex-1">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-gray-900">
          <ClipboardList className="w-7 h-7 text-[#d1383a]" /> Order Tracking
        </h2>

        {(!orders || orders.length === 0) ? (
          <p className="text-gray-500 text-center py-20 text-lg italic">
            No orders placed yet. Start by placing your first order →
          </p>
        ) : (
          <>
            {currentOrders.map((ord, idx) => {
              const createdAt = new Date(ord.createdAt).toLocaleDateString();
              const isExpanded = expandedOrder === ord._id;

              return (
                <motion.div
                  key={ord._id}
                  whileHover={{ scale: 1.01 }}
                  className="mb-6 bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition"
                >
                  {/* Order Header */}
                  <div
                    className="p-5 flex justify-between items-center cursor-pointer bg-gray-50 border-b hover:bg-gray-100"
                    onClick={() =>
                      setExpandedOrder(isExpanded ? null : ord._id)
                    }
                  >
                    <div>
                      <p className="font-semibold text-gray-800 text-lg">
                        Order #{idx + 1 + (currentPage - 1) * ordersPerPage} —{" "}
                        <span className="text-[#d1383a]">{ord.brandName}</span>{" "}
                        / {ord.moleculeName}
                      </p>
                    <p className="text-xs text-gray-500 mt-1">
<span className="font-medium">
  {ord.subCustomerId?.name || ord.customerId?.name || "Unknown"}
</span>

  Qty: {ord.quantity} • Placed on {new Date(ord.createdAt).toLocaleDateString()}
</p>

                    </div>
                    <ChevronDown
                      className={`w-6 h-6 text-gray-400 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {/* Expandable Progress Tracker */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="px-8 pb-8 pt-6 bg-white"
                      >
                        <div className="relative flex items-center justify-between">
                          {/* Progress Line */}
                          <div className="absolute top-4 left-6 right-6 h-1 bg-gray-200 rounded-full z-0" />
                          <motion.div
                            className="absolute top-4 left-6 h-1 bg-gradient-to-r from-[#d1383a] to-[#b73030] rounded-full z-10"
                            initial={{ width: 0 }}
                            animate={{
                              width: `${(ord.trackingStep / (orderSteps.length - 1)) * 100}%`,
                            }}
                            transition={{ duration: 0.6 }}
                          />

                          {/* Steps */}
                          {orderSteps.map((step, index) => (
                            <div
                              key={index}
                              className="flex-1 flex flex-col items-center text-center relative"
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 shadow-sm
                                ${
                                  index <= ord.trackingStep
                                    ? "bg-[#d1383a] border-[#d1383a] text-white"
                                    : "bg-white border-gray-300 text-gray-400"
                                }`}
                              >
                                {index < ord.trackingStep ? (
                                  <CheckCircle className="w-5 h-5" />
                                ) : (
                                  index + 1
                                )}
                              </div>
                              <p
                                className={`text-[11px] mt-2 max-w-[90px] leading-tight font-medium ${
                                  index <= ord.trackingStep
                                    ? "text-[#d1383a]"
                                    : "text-gray-400"
                                }`}
                              >
                                {step}
                              </p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-6 mt-8">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-semibold text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

     {/* Place Order Form */}
<div className="w-full lg:w-[380px] bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-gray-200 h-fit lg:sticky top-6 self-start">
  <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900">
    <Package className="w-6 h-6 text-[#d1383a]" /> Place New Order
  </h3>

  {/* Brand */}
  {/* Brand */}
<div className="mb-5">
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Select Brand
  </label>
  <div className="relative">
    <select
      className="w-full p-3 pl-10 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#d1383a] focus:border-[#d1383a] transition shadow-sm hover:shadow-md"
      value={selectedBrand}
      onChange={(e) => {
        const tm = brands.find((b) => b.selectedName === e.target.value);
        setSelectedBrand(tm?.selectedName || "");
        setSelectedMolecule(tm?.selectedBrandName || ""); // ✅ auto set molecule
      }}
    >
      <option value="">-- Select Brand --</option>
      {brands.map((b) => (
        <option key={b._id} value={b.selectedName}>
          {b.selectedName}
        </option>
      ))}
    </select>
  </div>
</div>

{/* Molecule (readonly like TrademarkTab) */}
{selectedMolecule && (
  <div className="mb-5">
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      Molecule
    </label>
    <p className="px-4 py-3 bg-gray-100 rounded-lg text-gray-800">
      {selectedMolecule}
    </p>
  </div>
)}


  {/* Molecule */}
  

  {/* Quantity */}
  <div className="mb-6">
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      Quantity
    </label>
    <div className="relative">
      <input
        type="number"
        className="w-full p-3 pl-10 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#d1383a] focus:border-[#d1383a] transition shadow-sm hover:shadow-md"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        placeholder="Enter quantity"
      />
    
    </div>
  </div>

  {/* Submit */}
  <button
    onClick={handleSubmit}
    disabled={loading}
    className="bg-gradient-to-r from-[#d1383a] to-[#b73030] text-white px-5 py-3 rounded-xl w-full font-semibold shadow-lg hover:scale-105 active:scale-95 transition transform duration-200"
  >
    {loading ? "Placing Order..." : "🚀 Place Order"}
  </button>

  {error && (
    <p className="text-red-500 mt-4 text-sm font-medium text-center">
      {error}
    </p>
  )}
</div>

    </div>
  );
};

export default PlaceOrderWithTracking;
