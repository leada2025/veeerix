import React, { useState, useEffect } from "react";
import Axios from "../api/Axios";

const DistributionPage = () => {
  const [activeTab, setActiveTab] = useState("customers");
  const [brands, setBrands] = useState([]);
  const [molecules, setMolecules] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
    drugLicense: "",
    gst: "",
    pan: "",
  });
  const [editingIndex, setEditingIndex] = useState(null);
const [brandMoleculeOptions, setBrandMoleculeOptions] = useState([]);

  const [salesOrders, setSalesOrders] = useState([]);
  const [orderData, setOrderData] = useState({
    customer: "",
    brandName: "",
    moleculeName: "",
    quantity: 1,
    notes: "",
  });

  // Load customers & orders
  useEffect(() => {
    fetchCustomers();
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id) fetchOrders({ distributorId: user.id });
  }, []);

  // Load brands & molecules
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const customerId = user?.id;

    const fetchBrandAndMolecule = async () => {
      try {
        const res = await Axios.get(`/orders/options/${customerId}`);
        const { brandNames, moleculeNames } = res.data;
        setBrands(brandNames || []);
        setMolecules(moleculeNames || []);
      } catch (err) {
        console.error("Failed to fetch brand and molecule", err);
      }
    };

    if (customerId) fetchBrandAndMolecule();
  }, []);

const fetchCustomers = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.id) return;

    const res = await Axios.get(`distribution/customers/${user.id}`);
    setCustomers(res.data);
  } catch (err) {
    console.error("Error fetching customers:", err);
  }
};


 useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.id) {
    fetchOrders({ distributorId: user.id });
  }
}, []);

const fetchOrders = async ({ distributorId }) => {
  try {
    const res = await Axios.get(`distribution/orders/distributor/${distributorId}`);
    setSalesOrders(res.data);
  } catch (err) {
    console.error("Error fetching orders:", err);
  }
};


  const handleCustomerChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const submitCustomer = async (e) => {
  e.preventDefault();
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const distributorId = user?.id; // logged-in distributor

    if (editingIndex !== null) {
      const id = customers[editingIndex]._id;
      const res = await Axios.put(`distribution/customers/${id}`, formData);
      const updated = [...customers];
      updated[editingIndex] = res.data;
      setCustomers(updated);
    } else {
      // Add distributorId to the new customer
      const payload = { ...formData, distributorId };
      const res = await Axios.post("distribution/customers", payload);
      setCustomers([...customers, res.data]);
    }

    setFormData({
      name: "",
      address: "",
      email: "",
      phone: "",
      drugLicense: "",
      gst: "",
      pan: "",
    });
    setEditingIndex(null);
    setShowCustomerModal(false);
  } catch (err) {
    console.error("Customer save error:", err);
  }
};

  const handleEdit = (index) => {
    setFormData(customers[index]);
    setEditingIndex(index);
    setShowCustomerModal(true);
  };

  const handleDelete = async (index) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this customer?");
    if (!confirmDelete) return;

    const id = customers[index]._id;
    try {
      await Axios.delete(`distribution/customers/${id}`);
      const updated = [...customers];
      updated.splice(index, 1);
      setCustomers(updated);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };


  
  const handleOrderChange = (e) => {
    setOrderData({ ...orderData, [e.target.name]: e.target.value });
  };

  const submitOrder = async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));
    const distributorId = user?.id;
    if (!distributorId) return alert("Logged-in user not found");
    if (!orderData.customer) return alert("Please select a customer");

    try {
      const payload = {
        customerId: distributorId,
        subCustomerId: orderData.customer, // _id from dropdown
        brandName: orderData.brandName,
        moleculeName: orderData.moleculeName,
        quantity: orderData.quantity,
        notes: orderData.notes,
      };

      const res = await Axios.post("distribution/orders", payload);
      setSalesOrders([...salesOrders, res.data]);

      setOrderData({
        customer: "",
        brandName: "",
        moleculeName: "",
        quantity: 1,
        notes: "",
      });
    } catch (err) {
      console.error("Order submission error:", err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#d1383a]">Distribution</h2>
      </div>

      <div className="flex space-x-4 mb-6 ">
        {["customers", "orders"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium ${
              activeTab === tab
                ? "text-[#d1383a] border-b-2 border-[#d1383a]"
                : "text-gray-500"
            }`}
          >
            {tab === "customers" ? "Customers" : "Sales Orders"}
          </button>
        ))}
      </div>

      {/* Customers */}
     {activeTab === "customers" && (
  <>
    <div className="flex justify-end mb-4">
      <button
        onClick={() => setShowCustomerModal(true)}
        className="flex items-center gap-2 bg-[#d1383a] text-white px-4 py-2 rounded-lg shadow hover:bg-[#b73030] transition"
      >
        + Add Customer
      </button>
    </div>

    {customers.length === 0 ? (
      <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow">
        No customers added yet.
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((cust, idx) => (
          <div
            key={cust._id}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition relative"
          >
            {/* Customer Info */}
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-gray-800">{cust.name}</h3>
              <p className="text-sm text-gray-600">{cust.email}</p>
              <p className="text-sm text-gray-600">{cust.phone}</p>
            </div>

            {/* Badges for GST and Drug License */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                GST: {cust.gst || "N/A"}
              </span>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                License: {cust.drugLicense || "N/A"}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 absolute top-4 right-4">
              <button
                onClick={() => handleEdit(idx)}
                className="text-blue-600 hover:underline text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(idx)}
                className="text-red-600 hover:underline text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </>
)}

      {/* Sales Orders */}
     {activeTab === "orders" && (
  <div className="space-y-6">
    {/* Create Sales Order Form */}
    <form
      onSubmit={submitOrder}
      className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 space-y-6"
    >
      <h3 className="text-2xl font-extrabold text-[#d1383a] mb-4">Create Sales Order</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="text-sm font-semibold text-gray-700">Customer</label>
          <select
            name="customer"
            value={orderData.customer}
            onChange={handleOrderChange}
            className="w-full mt-2 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#d1383a] transition shadow-sm hover:shadow-md"
            required
          >
            <option value="">Select Customer</option>
            {customers.map((cust) => (
              <option key={cust._id} value={cust._id}>{cust.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">Brand Name</label>
          <select
            name="brandName"
            value={orderData.brandName || ""}
            onChange={handleOrderChange}
            className="w-full mt-2 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#d1383a] transition shadow-sm hover:shadow-md"
            required
          >
            <option value="">Select Brand</option>
            {brands.map((b, idx) => (
              <option key={idx} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">Molecule Name</label>
          <select
            name="moleculeName"
            value={orderData.moleculeName || ""}
            onChange={handleOrderChange}
            className="w-full mt-2 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#d1383a] transition shadow-sm hover:shadow-md"
            required
          >
            <option value="">Select Molecule</option>
            {molecules.map((m, idx) => (
              <option key={idx} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">Quantity</label>
          <input
            type="number"
            name="quantity"
            value={orderData.quantity}
            min={1}
            onChange={handleOrderChange}
            className="w-full mt-2 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#d1383a] transition shadow-sm hover:shadow-md"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-700">Notes</label>
        <textarea
          name="notes"
          rows={3}
          value={orderData.notes}
          onChange={handleOrderChange}
          className="w-full mt-2 px-4 py-3 border rounded-xl resize-none focus:ring-2 focus:ring-[#d1383a] transition shadow-sm hover:shadow-md"
          placeholder="Additional instructions..."
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-[#d1383a] text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-[#b73030] transition transform hover:scale-105"
        >
          Submit Order
        </button>
      </div>
    </form>

    {/* Sales Orders Table */}
    <div className="overflow-x-auto bg-white shadow-xl rounded-2xl border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gradient-to-r from-[#fcd5d1] to-[#f8a1a1] text-gray-800 uppercase">
          <tr>
            <th className="px-6 py-3 text-left">Customer</th>
            <th className="px-6 py-3 text-left">Product</th>
            <th className="px-6 py-3 text-left">Molecule</th>
            <th className="px-6 py-3 text-left">Quantity</th>
            <th className="px-6 py-3 text-left">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {salesOrders.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-6 text-gray-500">
                No sales orders submitted yet.
              </td>
            </tr>
          ) : (
            salesOrders.map((order, idx) => (
              <tr key={order._id || idx} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium">{order.subCustomerId?.name || "Unknown"}</td>
                <td className="px-6 py-4">{order.brandName}</td>
                <td className="px-6 py-4">{order.moleculeName}</td>
                <td className="px-6 py-4">
                  <span className="inline-block bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded-full">
                    {order.quantity}
                  </span>
                </td>
                <td className="px-6 py-4">{order.notes || "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
)}

      {/* Customer Modal */}
   {showCustomerModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto border border-gray-200">
      {/* Modal Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-[#d1383a] flex items-center gap-2">
          {editingIndex !== null ? "Edit Customer" : "Add Customer"}
        </h3>
        <button
          onClick={() => setShowCustomerModal(false)}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          ✕
        </button>
      </div>

      {/* Form */}
      <form onSubmit={submitCustomer} className="space-y-5">
        {["name", "address", "email", "phone", "drugLicense", "gst", "pan"].map(
          (field) => (
            <div key={field} className="relative">
              <input
                name={field}
                value={formData[field]}
                onChange={handleCustomerChange}
                required
                className="peer w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#d1383a] focus:border-[#d1383a] outline-none transition shadow-sm hover:shadow-md"
                placeholder=" "
              />
              <label className="absolute left-4 top-3 text-gray-400 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-[#d1383a] peer-focus:text-xs capitalize">
                {field}
              </label>
            </div>
          )
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-4">
          <button
            type="button"
            onClick={() => setShowCustomerModal(false)}
            className="px-5 py-2 border rounded-xl text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-[#d1383a] text-white px-5 py-2 rounded-xl shadow hover:bg-[#b73030] transition transform hover:scale-105"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
)}

    </div>
  );
};

export default DistributionPage;
