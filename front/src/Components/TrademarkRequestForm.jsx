import React, { useEffect, useState } from "react";
import axios from "../api/Axios";
import TrademarkStatusTracker from "./TrademarkStatusTracker";
import { useSource } from "../Context/SourceContext";

const CustomerPortal = () => {
  const [suggestedNames, setSuggestedNames] = useState(["", "", "", "", ""]);
  const [submission, setSubmission] = useState(null);
  const [finalizedSubmission, setFinalizedSubmission] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const { source } = useSource();
  const user = JSON.parse(localStorage.getItem("user"));
  const customerId = user?.id;

  const isFishman = source === "fishman";
  const primaryColor = isFishman ? "#7b4159" : "#d1383a";

  useEffect(() => {
    if (customerId) {
      fetchSubmission();
    }
  }, [customerId]);

  const fetchSubmission = async () => {
    try {
      const [submissionRes, finalizedRes] = await Promise.all([
        axios.get(`/api/trademark/${customerId}`), // Now returns an array
        axios.get(`/api/trademark/finalized/${customerId}`)
      ]);

      const all = submissionRes.data;
      setSubmissions(all); // Store full history

      const active = all.find(item => item.trackingStatus !== "Registered");

      if (!active) {
        setSubmission(null);
        setFinalizedSubmission(null);
        setSuggestedNames(["", "", "", "", ""]);
      } else {
        setSubmission(active);
      }

      if (finalizedRes.data.length > 0) {
        setFinalizedSubmission(finalizedRes.data[0]);
      }
    } catch (err) {
      console.log("Error fetching submission:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index, value) => {
    const updated = [...suggestedNames];
    updated[index] = value;
    setSuggestedNames(updated);
  };

  const handleSubmitNames = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/trademark", {
        customerId,
        suggestions: suggestedNames,
      });
      setSubmission(res.data);
    } catch (err) {
      alert("Submission failed.");
    }
  };

  const handleSelectFinalName = async (name) => {
    try {
      await axios.post(`/api/trademark/${submission._id}/finalize`, {
        selectedName: name,
      });
      fetchSubmission(); // refresh data after selection
    } catch (err) {
      console.error("Selection failed.", err);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-2xl font-bold" style={{ color: primaryColor }}>
          Trademark Customer Portal
        </h2>

        {!submission ? (
          <p className="text-sm text-gray-500">
            Please submit 5 suggested brand names.
          </p>
        ) : !submission.selectedName ? (
          submission?.suggestedToCustomer?.length ? (
           <div>
  <h3
    className="text-lg font-semibold mb-3"
    style={{ color: primaryColor }}
  >
    Approved Names (Select one)
  </h3>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {submission.suggestedToCustomer.map((name, i) => (
      <div
        key={i}
        className="p-4 rounded-md border border-green-500 bg-green-50"
      >
        <div className="font-medium text-gray-800">{name}</div>
        <button
          onClick={() => handleSelectFinalName(name)}
          className="mt-2 text-sm text-white px-3 py-1 rounded-md"
          style={{ backgroundColor: primaryColor }}
        >
          Track This Name
        </button>
      </div>
    ))}
  </div>

  {/* Unavailable names in box format below */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
  {submission.suggestions
    .filter((s) => !submission.suggestedToCustomer.includes(s.name))
    .map((s, idx) => (
      <div
        key={idx}
        className="p-4 rounded-md border border-red-500 bg-red-50"
      >
        <div className="font-medium text-gray-800">{s.name}</div>
        <div className="text-xs text-red-500 italic mt-1">
          Status: Not Available
        </div>
      </div>
    ))}
</div>

</div>

          ) : (
            <p className="text-sm text-gray-500 italic">
              Waiting for admin to approve names for your review.
            </p>
          )
        ) : (
          <div className="p-4 border rounded-md bg-white shadow-sm">
            <h3
              className="text-lg font-semibold mb-3"
              style={{ color: primaryColor }}
            >
              Tracking: {submission.selectedName}
            </h3>
            <TrademarkStatusTracker
              currentStatus={submission.trackingStatus}
              highlightColor={primaryColor}
            />
            <p className="mt-3 text-sm text-gray-600">
              Current Status:{" "}
              <span className="font-medium" style={{ color: primaryColor }}>
                {submission.trackingStatus}
              </span>
            </p>
          </div>
        )}

        {/* ✅ TRACK HISTORY */}
       {submissions.length > 1 && (
  <div className="mt-10">
    <h3 className="text-xl font-semibold text-[#7b4159] mb-5">
      Previous Trademark Requests
    </h3>
    <ul className="space-y-4">
      {submissions
        .filter((s) => s._id !== submission?._id)
        .map((s, index) => (
          <li
            key={s._id}
            className="p-5 bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-medium text-[#7b4159]">Submitted:</span>{" "}
              {new Date(s.createdAt).toLocaleDateString()}
            </div>
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-medium text-[#7b4159]">Status:</span>{" "}
              {s.trackingStatus}
            </div>
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-medium text-[#7b4159]">Names:</span>{" "}
              {s.suggestions?.map((n) => n.name).join(", ")}
            </div>
            {s.selectedName && (
              <div className="text-sm text-gray-600">
                <span className="font-medium text-[#7b4159]">Selected:</span>{" "}
                {s.selectedName}
              </div>
            )}
          </li>
        ))}
    </ul>
  </div>
)}

      </div>

      {/* Suggestion form (only when no current active submission) */}
      {!submission && (
        <div className="bg-white p-6 border rounded-lg shadow-md h-fit">
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: primaryColor }}
          >
            Suggest Brand Names
          </h2>
          <form onSubmit={handleSubmitNames} className="flex flex-col gap-4">
            {suggestedNames.map((name, index) => (
              <input
                key={index}
                type="text"
                value={name}
                onChange={(e) => handleChange(index, e.target.value)}
                placeholder={`Brand Name ${index + 1}`}
                className="px-3 py-2 border rounded-md"
                style={{ borderColor: primaryColor }}
                required={index === 0}
              />
            ))}
            <button
              type="submit"
              className="mt-2 text-white px-4 py-2 rounded-md"
              style={{ backgroundColor: primaryColor }}
            >
              Submit Names
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CustomerPortal; 