import React from "react";
import { BASE_URL } from "../api/config";
import { FiCheck, FiUpload, FiFileText } from "react-icons/fi";

const SuggestionsTable = ({
  data = [],
  onSelect,
  isApproved = false,
  isFinalized = false,
  onTrackStatusChange,
  onUploadDoc,
  onTogglePayment,
}) => {
  const filteredData =
    !isApproved && !isFinalized
      ? data.filter((item) => !item.approvedNames || item.approvedNames.length === 0)
      : data;

  return (
    <div className="overflow-x-auto border border-[#7b4159]/30 rounded-xl shadow bg-white">
      <table className="min-w-full text-sm text-left border-separate border-spacing-y-2">
        {/* Table Head */}
        <thead className="bg-[#7b4159] text-white font-medium text-sm uppercase tracking-wide">
          <tr>
            <th className="p-3 rounded-l-lg">Customer</th>
            <th className="p-3">Submitted Names</th>
            {(isFinalized || isApproved) && <th className="p-3">Approved / Final</th>}
            {isFinalized && (
              <>
                <th className="p-3">Payment</th>
                <th className="p-3">Documents</th>
                <th className="p-3 rounded-r-lg">Track Status</th>
              </>
            )}
            {!isApproved && !isFinalized && <th className="p-3 rounded-r-lg">Action</th>}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="text-center py-6 text-gray-500 italic"
              >
                No data available
              </td>
            </tr>
          ) : (
            filteredData.map((item) => (
              <tr
                key={item._id}
                className="border-t border-gray-200 hover:bg-[#fdf8f9] transition"
              >
                {/* Customer */}
                <td className="p-3 font-medium text-gray-800">
                  {item.customerId?.name || item.customerId?.email || "N/A"}
                </td>

                {/* Submitted Names */}
                <td className="p-3 text-gray-700">
                  {item.suggestions?.length ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {item.suggestions
                        .filter((sug) => !item.selectedName || sug.name !== item.selectedName)
                        .map((sug, i) => (
                          <li key={i}>
                            {sug.name}
                            <span className="ml-1 text-xs text-gray-500">({sug.status})</span>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <span className="text-gray-400 italic">No suggestions</span>
                  )}
                </td>

                {/* Approved / Final */}
                {(isFinalized || isApproved) && (
                  <td className="p-3 text-green-700 font-semibold">
                    {item.selectedName || item.approvedNames?.join(", ") || "N/A"}
                  </td>
                )}

                {/* Finalized extras */}
                {isFinalized && (
                  <>
                    {/* Payment Toggle */}
                    <td className="p-3">
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
                        <span className="ml-2 text-sm text-gray-700">
                          {item.paymentCompleted ? "Paid" : "Pending"}
                        </span>
                      </label>
                    </td>

                    {/* Documents */}
                    <td className="p-3 space-y-2 text-sm">
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
                        <span className="text-gray-400 italic block">No documents</span>
                      )}
                      <button
                        className="flex items-center text-xs text-[#d1383a] hover:underline"
                        onClick={() => onUploadDoc(item._id)}
                      >
                        <FiUpload className="mr-1" /> Upload
                      </button>
                    </td>

                    {/* Tracking Status */}
                    <td className="p-3">
                      <div className="text-sm text-gray-700 font-medium">
                        {item.trackingStatus || "Not started"}
                      </div>
                      <select
                        className="mt-2 w-full text-sm border border-gray-300 px-2 py-1 rounded focus:ring-2 focus:ring-[#7b4159]"
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
                  </>
                )}

                {/* Approve Button */}
                {!isFinalized && !isApproved && (
                  <td className="p-3">
                    <button
                      onClick={() => onSelect(item)}
                      className="bg-[#7b4159] hover:bg-[#633447] text-white px-5 py-1.5 rounded-full text-sm shadow-sm transition"
                    >
                      Approve
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SuggestionsTable;
