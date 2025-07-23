import React from "react";

const customers = [
  {
    name: "Dr. KAVITHA M",
    email: "drkavitha29@gmail.com",
    executive: "Dharanya",
    position: "Doctor",
    status: "Active",
  },
  {
    name: "CREST PHARMACY",
    email: "ramu_ydiabetes@yahoo.com",
    executive: "Dharanya",
    position: "Distributor",
    status: "Active",
  },
];

const CustomerTable = () => {
  return (
    <div className="bg-white p-4 shadow rounded">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Customers</h2>
        <button className="bg-[#d1383a] text-white px-4 py-2 rounded hover:bg-[#b72e2e]">
          + Add Customer
        </button>
      </div>
      <input
        type="text"
        placeholder="Search"
        className="w-full p-2 mb-4 border rounded"
      />
      <table className="w-full table-auto text-left">
        <thead>
          <tr className="text-gray-600">
            <th>Customer Name</th>
            <th>Sales Executive</th>
            <th>Position</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c, idx) => (
            <tr key={idx} className="border-t">
              <td>
                <p>{c.name}</p>
                <p className="text-sm text-gray-500">{c.email}</p>
              </td>
              <td>{c.executive}</td>
              <td>{c.position}</td>
              <td>
                <span className="bg-green-100 text-green-700 text-sm px-2 py-1 rounded">
                  {c.status}
                </span>
              </td>
              <td>
                <button className="text-[#d1383a] hover:underline text-sm">
                  Edit ✏️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerTable;
