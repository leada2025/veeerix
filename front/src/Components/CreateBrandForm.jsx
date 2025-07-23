import React, { useState, useEffect } from "react";
import Select from "react-select";
import api from "../api/Axios";



const DynamicQuoteTable = () => {
  const [rows, setRows] = useState([]);
  const [loadingIndexes, setLoadingIndexes] = useState([]);
  const [moleculeOptions, setMoleculeOptions] = useState([]);

  const getCustomerId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?._id || user?.id || null;
    } catch {
      return null;
    }
  };

const fetchMoleculeOptions = async () => {
  try {
    const res = await api.get("/api/molecules");
    const options = res.data.map((mol) => ({
      value: mol.name,
      label: mol.name,
    }));
    setMoleculeOptions(options);
  } catch (err) {
    console.error("Failed to load molecules", err);
  }
};
useEffect(() => {
  fetchPreviousRequests();
  fetchMoleculeOptions(); // ← fetch molecules on load
}, []);


 const fetchPreviousRequests = async () => {
  const customerId = getCustomerId();

  if (!customerId || customerId.length !== 24) {
    const empty = [{ selected: null, manual: "", status: "Pending", payment: "Not Paid" }];
    setRows(empty);
    return empty;
  }

  try {
    const response = await api.get(`/api/brand-request/${customerId}`);
    const fetched = response.data.map((item) => ({
      _id: item._id,
      selected: item.moleculeName
        ? moleculeOptions.find((m) => m.value === item.moleculeName)
        : null,
      manual: item.customMolecule || "",
      status: item.status === "Pending" ? "Pending" : "Quote Requested",
      payment: item.paymentDone
        ? "Paid"
        : item.status === "Requested Payment"
        ? "Awaiting"
        : "Not Paid",
    }));

    // ✅ Ensure at least one row is shown for new quote
    const finalRows = fetched.length > 0
  ? [{ selected: null, manual: "", status: "Pending", payment: "Not Paid" }, ...fetched] // 👈 blank row at top
  : [{ selected: null, manual: "", status: "Pending", payment: "Not Paid" }];

    setRows(finalRows);
    return finalRows;
  } catch (err) {
    console.error("Fetch error:", err);
    const fallback = [{ selected: null, manual: "", status: "Pending", payment: "Not Paid" }];
    setRows(fallback);
    return fallback;
  }
};



  useEffect(() => {
    fetchPreviousRequests();
  }, []);

  const isDuplicate = (value, manual, indexToCheck) => {
    return rows.some((r, i) => {
      if (i === indexToCheck) return false;
      return (
        (value && r.selected?.value === value) ||
        (manual && r.manual.trim().toLowerCase() === manual.toLowerCase())
      );
    });
  };

  const handleSelectChange = (index, selectedOption) => {
    const updated = [...rows];
    updated[index].selected = selectedOption;
    updated[index].manual = "";
    setRows(updated);
  };

  const handleManualChange = (index, value) => {
    const updated = [...rows];
    updated[index].manual = value;
    updated[index].selected = null;
    setRows(updated);
  };

  const handleRequestQuote = async (index) => {
  const row = rows[index];
  const customerId = getCustomerId();
  const moleculeName = row.selected?.value || "";
  const manualEntry = row.manual.trim();

  if (!customerId || customerId.length !== 24) {
    alert("Invalid user session. Please login again.");
    return;
  }

  if (!moleculeName && !manualEntry) return;

  if (isDuplicate(moleculeName, manualEntry, index)) {
    alert("This molecule is already requested.");
    return;
  }

  try {
    setLoadingIndexes((prev) => [...prev, index]);

    await api.post("/api/brand-request", {
      moleculeName,
      customMolecule: manualEntry,
      customerId,
    });

    // ✅ Get latest list and manually add an empty row
    await fetchPreviousRequests();

  } catch (err) {
    console.error("Quote submission failed:", err);
    alert("Error sending quote. Try again.");
  } finally {
    setLoadingIndexes((prev) => prev.filter((i) => i !== index));
  }
};

  const handleDeleteRequest = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;

    try {
      await api.delete(`/api/brand-request/${id}`);
      await fetchPreviousRequests();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete request.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4">
      <h2 className="text-2xl font-semibold mb-6 text-[#d1383a]">Request a Quote</h2>
      <table className="w-full table-auto text-sm text-left">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="p-3">Molecule Category</th>
            <th className="p-3">Manual Entry</th>
            <th className="p-3">Status</th>
            <th className="p-3">Payment</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="p-3">
                <Select
                  options={moleculeOptions}
                  value={row.selected}
                  onChange={(option) => handleSelectChange(index, option)}
                  placeholder="Select Molecule"
                  className="text-sm"
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: "36px",
                      borderColor: "#d1383a",
                      boxShadow: "none",
                      "&:hover": { borderColor: "#b73030" },
                    }),
                  }}
                />
              </td>
              <td className="p-3">
                <input
                  type="text"
                  value={row.manual}
                  onChange={(e) => handleManualChange(index, e.target.value)}
                  placeholder="If not in the list, type here"
                  className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-[#d1383a]"
                />
              </td>
              <td className="p-3">{row.status}</td>
              <td className="p-3">{row.payment}</td>
              <td className="p-3 flex gap-2">
        {row.status === "Pending" ? (
  <button
    onClick={() => handleRequestQuote(index)}
    disabled={loadingIndexes.includes(index) || row._id} // ✅ disable if it's already submitted
    className={`px-3 py-1 rounded text-white ${
      loadingIndexes.includes(index) || row._id
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-[#d1383a] hover:bg-[#b73030]"
    }`}
  >
    {loadingIndexes.includes(index)
      ? "Requesting..."
      : "Request Quote"}
  </button>
) : (
  <span className="text-gray-500">Requested</span>
)}


                {row._id && (
                  <button
                    onClick={() => handleDeleteRequest(row._id)}
                    className="text-red-500 hover:underline text-xs"
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DynamicQuoteTable;
