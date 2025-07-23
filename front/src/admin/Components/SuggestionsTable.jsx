import React from "react";

const SuggestionsTable = ({
  data = [],
  onSelect,
  isApproved = false,
  isFinalized = false,
  onTrackStatusChange,
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
            {(isFinalized || isApproved) && (
              <>
                <th className="p-3">Approved/Final</th>
                <th className="p-3">Status</th>
              </>
            )}
            {!isApproved && !isFinalized && <th className="p-3">Action</th>}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item) => (
            <tr key={item._id} className="border-t hover:bg-gray-50">
              <td className="p-3">
                {item.customerId?.name || item.customerId?.email || "N/A"}
              </td>
              <td className="p-3">
                <ul className="list-disc pl-5">
                  {item.suggestions
                    .filter((sug) => !item.selectedName || sug.name !== item.selectedName)
                    .map((sug, i) => (
                      <li key={i}>
                        {sug.name}{" "}
                        <span className="text-xs text-gray-500">({sug.status})</span>
                      </li>
                    ))}
                </ul>
              </td>

              {(isApproved || isFinalized) ? (
                <>
                  <td className="p-3 text-green-600 font-medium">
                    {item.selectedName || item.approvedNames?.join(", ")}
                  </td>
                  <td className="p-3">
                    <div>{item.trackingStatus || "Not started"}</div>
                    <select
                      className="mt-2 w-full text-sm border border-gray-300 px-2 py-1 rounded focus:ring-2 focus:ring-[#d1383a]"
                      value={item.trackingStatus || ""}
                      onChange={(e) =>
                        onTrackStatusChange(item._id, e.target.value)
                      }
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
              ) : (
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
