import React, { useEffect, useState } from "react";
import axios from "../api/Axios";
import { useSource } from "../Context/SourceContext";

const CustomerPortal = () => {
  const [suggestedNames, setSuggestedNames] = useState(["", "", "", "", ""]);
  const [submissions, setSubmissions] = useState([]);
  const [finalizedSubmission, setFinalizedSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  

  const { source } = useSource();
  const user = JSON.parse(localStorage.getItem("user"));
  const customerId = user?.id;

  const isFishman = source === "fishman";
  const primaryColor = isFishman ? "#7b4159" : "#d1383a";

  useEffect(() => {
    if (customerId) {
      fetchSubmissions();
    }
  }, [customerId]);

  const fetchSubmissions = async () => {
    try {
      const [submissionRes, finalizedRes] = await Promise.all([
        axios.get(`/api/trademark/${customerId}`),
        axios.get(`/api/trademark/finalized/${customerId}`)
      ]);

      const all = submissionRes.data || [];
      setSubmissions(all);

      if (finalizedRes.data?.length > 0) {
        setFinalizedSubmission(finalizedRes.data[0]);
      }
    } catch (err) {
      console.log("Error fetching submissions:", err);
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
      setSubmissions((prev) => [...prev, res.data]);
      setSuggestedNames(["", "", "", "", ""]);
    } catch (err) {
      alert("Submission failed.");
    }
  };

  const handleSelectFinalName = async (submissionId, name) => {
    try {
      await axios.post(`/api/trademark/${submissionId}/finalize`, {
        selectedName: name,
      });
      fetchSubmissions();
    } catch (err) {
      console.error("Selection failed.", err);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  const pendingSubmissions = submissions.filter(s => !s.selectedName);

  return (
    <div className="max-w-7xl mx-auto mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-2xl font-bold" style={{ color: primaryColor }}>
          Trademark Customer Portal
        </h2>

        {pendingSubmissions.length === 0 && (
          <p className="text-sm text-gray-500">
            Please submit 5 suggested brand names.
          </p>
        )}

        {pendingSubmissions.map((submission, index) => (
          <div key={submission._id} className="space-y-4">
            <h3 className="font-semibold text-md text-gray-700">
              Submission Round {index + 1}
            </h3>

            {submission.suggestedToCustomer?.length > 0 ? (
              <div>
                <h4 className="text-lg font-semibold mb-2" style={{ color: primaryColor }}>
                  Approved Names (Select one)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {submission.suggestedToCustomer.map((name, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-md border border-green-500 bg-green-50"
                    >
                      <div className="font-medium text-gray-800">{name}</div>
                      <button
                        onClick={() => handleSelectFinalName(submission._id, name)}
                        className="mt-2 text-sm text-white px-3 py-1 rounded-md"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Track This Name
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  {submission.suggestions
                    .filter(s => !submission.suggestedToCustomer.includes(s.name))
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
            )}
          </div>
        ))}

        {finalizedSubmission?.selectedName && (
          <p className="text-sm text-gray-600 italic">
            Your names has been submitted. You can track it in the{" "}
            <a href="/trademarks/track" className="text-blue-500 underline">
              Trademark Status
            </a>{" "}
            page.
          </p>
        )}
      </div>

      {/* Always show name suggestion form */}
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
    </div>
  );
};

export default CustomerPortal;
