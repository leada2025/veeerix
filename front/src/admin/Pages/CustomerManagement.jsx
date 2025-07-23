import React, { useEffect, useState } from "react";
import axios from "../api/Axios";
import { Plus } from "lucide-react";

const PRIMARY_COLOR = "#d1383a";

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const fetchCustomers = async () => {
    try {
      const res = await axios.get("/api/users");
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddCustomer = async () => {
    try {
      await axios.post("/api/users/create", formData);
      setOpen(false);
      setFormData({ email: "", password: "" });
      fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActivation = async (id, active) => {
    try {
      await axios.put(`/api/users/${id}/activate`, { active: !active });
      fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Customer List</h2>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 text-white px-4 py-2 rounded"
          style={{ backgroundColor: PRIMARY_COLOR }}
        >
          <Plus size={18} /> Add Customer
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase">
            <tr>
              <th className="px-6 py-3">Name</th>

              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((user) => (
              <tr key={user._id} className="border-b">
                <td className="px-6 py-4">{user.name}</td>

                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.role}</td>
                <td className="px-6 py-4">
                  {user.active ? "Active" : "Inactive"}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() =>
                      handleToggleActivation(user._id, user.active)
                    }
                    className="px-3 py-1 text-sm text-white rounded"
                    style={{ backgroundColor: PRIMARY_COLOR }}
                  >
                    {user.active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Add New Customer</h3>
            <div className="space-y-4">
              <input
  type="text"
  placeholder="Customer Name"
  className="w-full border rounded p-2"
  value={formData.name || ""}
  onChange={(e) =>
    setFormData({ ...formData, name: e.target.value })
  }
/>

              <input
                type="email"
                placeholder="Customer Email"
                className="w-full border rounded p-2"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <input
                type="password"
                placeholder="Set Password"
                className="w-full border rounded p-2"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <button
                onClick={handleAddCustomer}
                className="w-full text-white py-2 rounded"
                style={{ backgroundColor: PRIMARY_COLOR }}
              >
                Add Customer
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-full border py-2 rounded mt-2 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
