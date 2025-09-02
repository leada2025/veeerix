import React, { useEffect, useState,useMemo } from "react";
import { BASE_URL } from "../api/config";
import { FiCheck, FiUpload, FiFileText,  FiSearch } from "react-icons/fi";
import { CheckCircle } from "lucide-react";
// Pending Suggestions Table

// ✅ Updated PendingTable with inline checkboxes
const PendingTable = ({ data = [], onSelect }) => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNames, setSelectedNames] = useState({});
  const [approvedItems, setApprovedItems] = useState([]); // Tracks locally approved
  const pageSize = 5;

  // Filter data based on search but keep approved items visible
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const customer = item.customerId?.name || item.customerId?.email || "";
      const suggestions = item.suggestions?.map((s) => s.name).join(" ").toLowerCase() || "";
      return (
        customer.toLowerCase().includes(search.toLowerCase()) ||
        suggestions.includes(search.toLowerCase())
      );
    });
  }, [data, search]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage]);

  const toggleName = (itemId, name) => {
    // Prevent toggling already approved items
    const isApproved = approvedItems.includes(itemId) || data.find(d => d._id === itemId)?.suggestedToCustomer?.includes(name);
    if (isApproved) return;

    setSelectedNames((prev) => {
      const existing = prev[itemId] || [];
      if (existing.includes(name)) {
        return { ...prev, [itemId]: existing.filter((n) => n !== name) };
      } else {
        return { ...prev, [itemId]: [...existing, name] };
      }
    });
  };

  const handleApprove = (itemId) => {
    const names = selectedNames[itemId] || [];
    if (!names.length) return;
    onSelect(itemId, names, "");
    setApprovedItems((prev) => [...prev, itemId]);
  };

  return (
    <div className="overflow-x-auto rounded-xl shadow bg-white mb-8">
      <div className="bg-gradient-to-r from-[#7b4159] to-[#d1383a] text-white px-6 py-3 rounded-t-2xl flex items-center justify-between">
        <h3 className="font-semibold tracking-wide uppercase text-sm">
          Pending Suggestions
        </h3>
        <span className="text-xs opacity-80">{filteredData.length} Records</span>
      </div>

      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <input
          type="text"
          placeholder="Search by customer or suggestion..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full sm:w-72 px-3 py-2 rounded-lg text-sm focus:outline-none"
        />
      </div>

      <table className="min-w-full text-sm text-left border-separate border-spacing-y-2">
        <thead className="bg-gray-100 text-gray-700 font-semibold text-sm uppercase tracking-wide">
          <tr>
            <th className="p-3 rounded-l-lg">Customer</th>
            <th className="p-3">Submitted Names</th>
            <th className="p-3 rounded-r-lg">Action</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center py-6 text-gray-500 italic">
                No matching suggestions
              </td>
            </tr>
          ) : (
            paginatedData.map((item) => {
              const isApproved = approvedItems.includes(item._id) || (item.suggestedToCustomer?.length > 0);

              return (
                <tr
                  key={item._id}
                  className={`border-t border-gray-200 hover:bg-[#fdf8f9] transition ${
                    isApproved ? "bg-green-50" : ""
                  }`}
                >
                  <td className="p-3 font-medium text-gray-800">
                    {item.customerId?.name || item.customerId?.email || "N/A"}
                  </td>

                  <td className="p-3 text-gray-700">
                    {item.suggestions?.length ? (
                      <ul className="space-y-1">
                        {item.suggestions.map((sug, i) => {
                          const isNameApproved = selectedNames[item._id]?.includes(sug.name) ||
                            item.suggestedToCustomer?.includes(sug.name);
                          return (
                            <li key={i} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isNameApproved}
                                onChange={() => toggleName(item._id, sug.name)}
                                disabled={item.suggestedToCustomer?.includes(sug.name)}
                              />
                              <span>
                                {sug.name}
                                <span className="ml-1 text-xs text-gray-500">
                                  ({sug.status})
                                </span>
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <span className="text-gray-400 italic">No suggestions</span>
                    )}
                  </td>

                  <td className="p-3">
                    {isApproved ? (
                      <span className="text-green-700 font-semibold flex items-center gap-1">
                        Approved <CheckCircle className="w-4 h-4" />
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApprove(item._id)}
                        disabled={!selectedNames[item._id]?.length}
                        className="bg-[#7b4159] hover:bg-[#633447] disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-5 py-1.5 rounded-full text-sm shadow-sm transition"
                      >
                        Approve Selected
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200 text-sm">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="space-x-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Finalized Suggestions Table

const FinalizedTable = ({ data = [], onTrackStatusChange, onUploadDoc, onTogglePayment }) => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // 🔍 Filtered data based on search
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const customer = item.customerId?.name || item.customerId?.email || "";
      const name = item.selectedName || item.approvedNames?.join(", ") || "";
      return (
        customer.toLowerCase().includes(search.toLowerCase()) ||
        name.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [data, search]);

  // 📄 Pagination calculations
  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-sm bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#7b4159] to-[#d1383a] text-white px-6 py-3 rounded-t-2xl flex items-center justify-between">
        <h3 className="font-semibold tracking-wide uppercase text-sm">
          Finalized Suggestions
        </h3>
        <span className="text-xs opacity-80">{filteredData.length} Records</span>
      </div>

      {/* Search */}
      <div className="p-4 flex items-center  gap-2 border-b border-gray-100">
        <FiSearch className="text-gray-400" />
        <input
          type="text"
          placeholder="Search by customer or name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // reset to first page when searching
          }}
         className="w-full h-sm border-none focus:ring-0 focus:outline-none text-md placeholder-gray-400"
        />
      </div>

      {/* Table */}
      <table className="min-w-full text-sm min-h-full border-spacing-y-2">
        <thead className="bg-gray-50 text-gray-700 font-semibold text-left uppercase tracking-wide">
          <tr>
            <th className="p-3 rounded-l-lg">Customer</th>
            <th className="p-3">Final Name</th>
            <th className="p-3">Payment</th>
            <th className="p-3">Documents</th>
            <th className="p-3 rounded-r-lg">Track Status</th>
          </tr>
        </thead>

        <tbody>
          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-8 text-gray-500 italic">
                No finalized records found
              </td>
            </tr>
          ) : (
            paginatedData.map((item) => (
              <tr
                key={item._id}
                className="bg-white shadow-sm border border-gray-100 hover:border-[#7b4159]/40 transition rounded-lg"
              >
                {/* Customer */}
                <td className="p-4 font-medium text-gray-800">
                  {item.customerId?.name || item.customerId?.email || "N/A"}
                </td>

                {/* Final Name */}
                <td className="p-4 text-green-700 font-semibold">
                  {item.selectedName || item.approvedNames?.join(", ") || "N/A"}
                </td>

                {/* Payment Toggle */}
                <td className="p-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.paymentCompleted}
                      onChange={(e) => onTogglePayment(item._id, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-gray-300 peer-checked:bg-[#7b4159] rounded-full transition duration-300">
                      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white border rounded-full shadow transform peer-checked:translate-x-5 transition" />
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {item.paymentCompleted ? "Paid" : "Pending"}
                    </span>
                  </label>
                </td>

                {/* Documents */}
                <td className="p-4 space-y-2 text-sm">
                  {item.adminDocumentUrl || item.customerSignedDocUrl ? (
                    <>
                      {item.adminDocumentUrl && (
                        <a
                          href={`${BASE_URL}${item.adminDocumentUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center text-[#7b4159] hover:underline"
                        >
                          <FiFileText className="mr-1" /> Admin Doc
                        </a>
                      )}
                      {item.customerSignedDocUrl && (
                        <a
                          href={`${BASE_URL}${item.customerSignedDocUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center text-green-600 hover:underline"
                        >
                          <FiCheck className="mr-1" /> Signed Doc
                        </a>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-400 italic block">
                      No documents
                    </span>
                  )}
                  <button
                    className="flex items-center text-xs font-medium text-[#d1383a] hover:underline hover:text-[#7b4159] transition"
                    onClick={() => onUploadDoc(item._id)}
                  >
                    <FiUpload className="mr-1" /> Upload
                  </button>
                </td>

                {/* Tracking Status */}
                <td className="p-4">
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    {item.trackingStatus || "Not started"}
                  </div>
                  <select
                    className="w-full text-sm border border-gray-300 px-2 py-1.5 rounded-lg focus:ring-2 focus:ring-[#7b4159] bg-gray-50"
                    value={item.trackingStatus || ""}
                    onChange={(e) => onTrackStatusChange(item._id, e.target.value)}
                  >
                    <option value="">Update Status</option>
                    <option>New TM Application</option>
                    <option>Send to Vienna Codification</option>
                    <option>Formalities Check Pass</option>
                    <option>Marked for Exam</option>
                    <option>Examination Report Issued</option>
                    <option>Accepted and Advertised</option>
                    <option>Registered</option>
                  </select>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t border-gray-100 text-sm">
        <span className="text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <div className="space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-lg border text-gray-600 disabled:opacity-50 hover:bg-gray-100"
          >
            Prev
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-lg border text-gray-600 disabled:opacity-50 hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
// Parent Component
// Parent Component
const SuggestionsTable = ({
  data,
  onSelect,
  onTrackStatusChange,
  onUploadDoc,
  onTogglePayment,
  isApproved = false,
  isFinalized = false,
}) => {
  return (
    <div className="space-y-10">
      {/* Show Pending Table only when not approved & not finalized */}
      {!isApproved && !isFinalized && (
        <PendingTable data={data} onSelect={onSelect} />
      )}

      {/* Show Finalized Table only when finalized */}
      {isFinalized && (
        <FinalizedTable
          data={data}
          onTrackStatusChange={onTrackStatusChange}
          onUploadDoc={onUploadDoc}
          onTogglePayment={onTogglePayment}
        />
      )}

      {/* Show Approved Table if you need it later */}
      {isApproved && !isFinalized && (
        <div className="overflow-x-auto border border-[#7b4159]/30 rounded-xl shadow bg-white">
          <h3 className="bg-[#7b4159] text-white px-4 py-2 rounded-t-xl font-medium uppercase text-sm">
            Approved Suggestions
          </h3>
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700 font-semibold text-sm uppercase tracking-wide">
              <tr>
                <th className="p-3">Customer</th>
                <th className="p-3">Approved Names</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="text-center py-6 text-gray-500 italic"
                  >
                    No approved records
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item._id} className="border-t border-gray-200">
                    <td className="p-3 font-medium text-gray-800">
                      {item.customerId?.name ||
                        item.customerId?.email ||
                        "N/A"}
                    </td>
                    <td className="p-3 text-green-700 font-semibold">
                      {item.approvedNames?.join(", ") || "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SuggestionsTable;
