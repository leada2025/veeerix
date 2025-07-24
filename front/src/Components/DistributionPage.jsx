import React, { useState, useEffect } from "react";
import Axios from "../api/Axios";

const DistributionPage = () => {
  const [activeTab, setActiveTab] = useState("customers");

  const [customers, setCustomers] = useState([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "", address: "", email: "", phone: "", drugLicense: "", gst: "", pan: "",
  });
  const [editingIndex, setEditingIndex] = useState(null);

  const [salesOrders, setSalesOrders] = useState([]);
  const [orderData, setOrderData] = useState({
    customer: "", product: "", quantity: 1, notes: "",
  });

  // Load customers & orders from backend
  useEffect(() => {
    fetchCustomers();
    fetchOrders();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await Axios.get("distribution/customers");
      setCustomers(res.data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await Axios.get("distribution/orders");
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
      if (editingIndex !== null) {
        const id = customers[editingIndex]._id;
        const res = await Axios.put(`distribution/customers/${id}`, formData);
        const updated = [...customers];
        updated[editingIndex] = res.data;
        setCustomers(updated);
      } else {
        const res = await Axios.post("distribution/customers", formData);
        setCustomers([...customers, res.data]);
      }

      setFormData({
        name: "", address: "", email: "", phone: "", drugLicense: "", gst: "", pan: "",
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
    const selectedCustomer = customers.find(c => c.name === orderData.customer);
    if (!selectedCustomer) return alert("Customer not found");

    try {
      const payload = {
        customerId: "64f1c447...loggedInUserId", // Replace with actual user ID if using auth
        subCustomerId: selectedCustomer._id,
        brandName: orderData.product,
        moleculeName: "Default Molecule",
        quantity: orderData.quantity,
        notes: orderData.notes,
      };

      const res = await Axios.post("distribution/orders", payload);
      setSalesOrders([...salesOrders, res.data]);
      setOrderData({ customer: "", product: "", quantity: 1, notes: "" });
    } catch (err) {
      console.error("Order submission error:", err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#d1383a]">Distribution</h2>
      </div>

      <div className="flex space-x-4 mb-6 border-b">
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
              className="bg-[#d1383a] text-white px-4 py-2 rounded hover:bg-[#b73030]"
            >
              + Add Customer
            </button>
          </div>

          <div className="bg-white shadow rounded-md overflow-hidden border">
            <table className="w-full table-auto">
              <thead className="bg-[#f8f8f8] text-sm text-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Phone</th>
                  <th className="px-4 py-2 text-left">GST</th>
                  <th className="px-4 py-2 text-left">Drug License</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-500">
                      No customers added yet.
                    </td>
                  </tr>
                ) : (
                  customers.map((cust, idx) => (
                    <tr key={cust._id} className="text-sm border-t">
                      <td className="px-4 py-2">{cust.name}</td>
                      <td className="px-4 py-2">{cust.email}</td>
                      <td className="px-4 py-2">{cust.phone}</td>
                      <td className="px-4 py-2">{cust.gst}</td>
                      <td className="px-4 py-2">{cust.drugLicense}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <button onClick={() => handleEdit(idx)} className="text-blue-600 hover:underline">Edit</button>
                        <button onClick={() => handleDelete(idx)} className="text-red-600 hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Sales Orders */}
      {activeTab === "orders" && (
        <div className="grid gap-6">
          <form onSubmit={submitOrder} className="bg-white p-6 rounded shadow border space-y-4">
            <h3 className="text-lg font-semibold text-[#d1383a]">Create Sales Order</h3>

            <div>
              <label className="text-sm text-gray-700">Customer</label>
              <select
                name="customer"
                value={orderData.customer}
                onChange={handleOrderChange}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                required
              >
                <option value="">Select Customer</option>
                {customers.map((cust) => (
                  <option key={cust._id} value={cust.name}>{cust.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-700">Product Name</label>
              <input
                type="text"
                name="product"
                value={orderData.product}
                onChange={handleOrderChange}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={orderData.quantity}
                min={1}
                onChange={handleOrderChange}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">Notes</label>
              <textarea
                name="notes"
                rows={3}
                value={orderData.notes}
                onChange={handleOrderChange}
                className="w-full mt-1 px-3 py-2 border rounded-md resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-[#d1383a] text-white px-4 py-2 rounded hover:bg-[#b73030]"
              >
                Submit Order
              </button>
            </div>
          </form>

          <div className="bg-white border rounded-md shadow overflow-hidden">
            <table className="w-full text-sm table-auto">
              <thead className="bg-[#f8f8f8] text-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">Customer</th>
                  <th className="px-4 py-2 text-left">Product</th>
                  <th className="px-4 py-2 text-left">Quantity</th>
                  <th className="px-4 py-2 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {salesOrders.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-gray-500">
                      No sales orders submitted yet.
                    </td>
                  </tr>
                ) : (
                  salesOrders.map((order, idx) => (
                    <tr key={order._id || idx} className="border-t">
                      <td className="px-4 py-2">{order.subCustomerId?.name || "Unknown"}</td>
                      <td className="px-4 py-2">{order.brandName}</td>
                      <td className="px-4 py-2">{order.quantity}</td>
                      <td className="px-4 py-2">{order.notes}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-[#d1383a] mb-4">
              {editingIndex !== null ? "Edit Customer" : "Add Customer"}
            </h3>
            <form onSubmit={submitCustomer} className="space-y-4">
              {["name", "address", "email", "phone", "drugLicense", "gst", "pan"].map((field) => (
                <div key={field}>
                  <label className="text-sm text-gray-700 capitalize">{field}</label>
                  <input
                    name={field}
                    value={formData[field]}
                    onChange={handleCustomerChange}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    required
                  />
                </div>
              ))}

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(false)}
                  className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#d1383a] text-white px-4 py-2 rounded hover:bg-[#b73030]"
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
