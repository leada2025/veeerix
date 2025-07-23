import React, { useState } from "react";

const initialStatusData = [
  { brand: "Veerix", product: "Aceclofenac 100mg", status: "Pending" },
  { brand: "Veerix", product: "Acebrophylline 200mg", status: "Approved" },
  { brand: "Veerix", product: "Paracetamol 325mg", status: "Processing" },
];

const statusOptions = ["Pending", "Processing", "Approved"];

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800",
  Processing: "bg-blue-100 text-blue-800",
  Approved: "bg-green-100 text-green-800",
};

const StatusPage = () => {
  const [orders, setOrders] = useState(initialStatusData);

  const handleStatusChange = (index, newStatus) => {
    const updatedOrders = [...orders];
    updatedOrders[index].status = newStatus;
    setOrders(updatedOrders);
    console.log("Updated Order Status:", updatedOrders[index]);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white border rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-[#d1383a]">Order Status Management</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-200">
          <thead className="bg-gray-50 text-gray-700 text-left">
            <tr>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr
                key={index}
                className="border-t hover:bg-gray-50 transition-all"
              >
                <td className="px-4 py-3 font-medium text-gray-800">{order.brand}</td>
                <td className="px-4 py-3">{order.product}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(index, e.target.value)}
                    className="px-3 py-1 rounded-md border text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d1383a]"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatusPage;
