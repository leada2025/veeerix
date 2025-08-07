import React from "react";
import { BASE_URL } from "../api/config"; // adjust path as needed

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
    <div className="overflow-x-auto border border-gray-200 rounded-xl shadow bg-white">
      <table className="min-w-full text-sm text-left table-auto border-separate border-spacing-y-2">
        <thead className="bg-[#fbeaea] text-[#d1383a] font-semibold text-sm uppercase">
          <tr>
            <th className="p-3">Customer</th>
            <th className="p-3">Submitted Names</th>
            {(isFinalized || isApproved) && <th className="p-3">Approved/Final</th>}
            {isFinalized && (
              <>
                <th className="p-3">Payment</th>
                <th className="p-3">Documents</th>
                <th className="p-3">Track Status</th>
              </>
            )}
            {!isApproved && !isFinalized && <th className="p-3">Action</th>}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item) => (
            <tr key={item._id} className="border-t hover:bg-gray-50">
              <td className="p-3">{item.customerId?.name || item.customerId?.email || "N/A"}</td>

              <td className="p-3">
                <ul className="list-disc pl-5">
                  {item.suggestions
                    .filter((sug) => !item.selectedName || sug.name !== item.selectedName)
                    .map((sug, i) => (
                      <li key={i}>
                        {sug.name} <span className="text-xs text-gray-500">({sug.status})</span>
                      </li>
                    ))}
                </ul>
              </td>

              {(isFinalized || isApproved) && (
                <td className="p-3 text-green-600 font-medium">
                  {item.selectedName || item.approvedNames?.join(", ") || "N/A"}
                </td>
              )}

              {isFinalized && (
                <>
                  {/* Payment */}
                  <td className="p-3">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.paymentCompleted}
                        onChange={(e) => onTogglePayment(item._id, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="relative w-10 h-5 bg-gray-300 peer-checked:bg-green-500 rounded-full transition duration-300">
                        <div className="absolute left-0 top-0 w-5 h-5 bg-white border rounded-full shadow transform peer-checked:translate-x-full transition" />
                      </div>
                    </label>
                  </td>

                  {/* Documents */}
                  <td className="p-3 space-y-1">
                   {/* Admin Document */}
{item.adminDocumentUrl && (
  <div>
    <a
      href={`${BASE_URL}${item.adminDocumentUrl}`}
      target="_blank"
      rel="noreferrer"
      className="text-blue-600 underline text-xs"
    >
      Admin Doc
    </a>
  </div>
)}

{/* Customer Signed Document */}
{item.customerSignedDocUrl && (
  <div>
    <a
      href={`${BASE_URL}${item.customerSignedDocUrl}`}
      target="_blank"
      rel="noreferrer"
      className="text-green-600 underline text-xs"
    >
      Signed Doc
    </a>
  </div>
)}

                    <button
                      className="text-xs text-[#d1383a] underline"
                      onClick={() => onUploadDoc(item._id)}
                    >
                      Upload
                    </button>
                  </td>

                  {/* Tracking Status */}
                  <td className="p-3">
                    <div>{item.trackingStatus || "Not started"}</div>
                    <select
                      className="mt-2 w-full text-sm border border-gray-300 px-2 py-1 rounded focus:ring-2 focus:ring-[#d1383a]"
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

              {!isFinalized && !isApproved && (
                <td className="p-3">
                  <button
                    onClick={() => onSelect(item)}
                    className="bg-[#d1383a] hover:bg-[#b93032] text-white px-4 py-1 rounded-full text-sm"
                  >
                    Approve
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SuggestionsTable;
