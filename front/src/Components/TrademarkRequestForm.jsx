import React, { useEffect, useState } from "react";
import axios from "../api/Axios";
import { useSource } from "../Context/SourceContext";
import { BASE_URL } from "../api/config";
const CustomerPortal = () => {
  const [suggestedNames, setSuggestedNames] = useState(["", "", "", "", ""]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState({});
  const { source } = useSource();

  const user = JSON.parse(localStorage.getItem("user"));
  const customerId = user?.id;
  const isFishman = source === "fishman";
  const primaryColor = isFishman ? "#7b4159" : "#d1383a";

  useEffect(() => {
    if (customerId) fetchSubmissions();
  }, [customerId]);

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get(`/api/trademark/${customerId}`);
      setSubmissions(res.data || []);
    } catch (err) {
      console.error("Error fetching submissions:", err);
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
      console.error("Final selection failed:", err);
    }
  };

  const handlePayment = async (submissionId) => {
    try {
      await axios.post(`/api/trademark/${submissionId}/payment`);
      fetchSubmissions();
    } catch (err) {
      alert("Payment failed.");
    }
  };

  const handleCustomerDocUpload = async (e, submissionId) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("signedDoc", files[submissionId]);

    try {
      await axios.post(`/api/trademark/${submissionId}/upload-signed-doc`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFiles(prev => ({ ...prev, [submissionId]: null }));
      fetchSubmissions();
    } catch (err) {
      console.error("Document upload failed:", err);
    }
  };

  const pendingSubmissions = submissions.filter((s) => !s.selectedName);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT - Submissions & Status */}
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-2xl font-bold" style={{ color: primaryColor }}>
          Trademark Customer Portal
        </h2>

        {pendingSubmissions.length === 0 && (
          <p className="text-sm text-gray-500">
            Please submit 5 brand name suggestions to start your trademark process.
          </p>
        )}

        {submissions.map((submission, index) => (
          <div key={submission._id} className="p-4 border rounded-lg space-y-4 bg-gray-50">
            <h3 className="font-semibold">Submission Round {index + 1}</h3>

            {/* Admin Approval Block */}
            {submission.suggestedToCustomer?.length > 0 ? (
              <>
                {!submission.selectedName ? (
                  <>
                    <h4 className="text-md font-semibold">Approved Names</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {submission.suggestedToCustomer.map((name, i) => (
                        <div
                          key={i}
                          className="border p-3 bg-green-50 border-green-400 rounded"
                        >
                          <p className="font-medium">{name}</p>
                          <button
                            onClick={() => handleSelectFinalName(submission._id, name)}
                            className="mt-2 text-sm text-white px-3 py-1 rounded"
                            style={{ backgroundColor: primaryColor }}
                          >
                            Select This Name
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : !submission.paymentCompleted ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-400 rounded">
                    <p className="text-sm mb-2">Please complete payment to proceed.</p>
                    <button
                      onClick={() => handlePayment(submission._id)}
                      className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                      Pay ₹1500
                    </button>
                  </div>
                                ) : (
                  <div className="space-y-3">
                    <div className="p-4 bg-green-50 border border-green-400 rounded">
                      <p className="text-sm font-semibold text-green-800">
                        Selected Trademark Name: <span className="font-bold">{submission.selectedName}</span>
                      </p>
                    </div>

                    {!submission.paymentCompleted ? (
                      <div className="p-4 bg-yellow-50 border border-yellow-400 rounded">
                        <p className="text-sm mb-2">Please complete payment to proceed.</p>
                        <button
                          onClick={() => handlePayment(submission._id)}
                          className="bg-green-600 text-white px-4 py-2 rounded"
                        >
                          Pay ₹1500
                        </button>
                      </div>
                    ) : submission.adminDocumentUrl ? (
                      <>
                    <a
  href={`${BASE_URL}/${submission.adminDocumentUrl?.replace(/^\/+/, "")}`}
  className="text-blue-500 underline text-sm"
  target="_blank"
  rel="noopener noreferrer"
>
  Download Legal Document
</a>


                        {!submission.customerSignedDocUrl ? (
                          <form onSubmit={(e) => handleCustomerDocUpload(e, submission._id)}>
                            <input
                              type="file"
                              accept="application/pdf"
                              required
                              onChange={(e) =>
                                setFiles((prev) => ({
                                  ...prev,
                                  [submission._id]: e.target.files[0],
                                }))
                              }
                              className="text-sm block"
                            />
                            <button
                              type="submit"
                              className="mt-2 bg-blue-600 text-white px-3 py-1 rounded"
                            >
                              Upload Signed Document
                            </button>
                          </form>
                        ) : (
                          <p className="text-sm text-green-600">
                            Signed document uploaded. Your process is under review.
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        Awaiting admin to upload the legal document.
                      </p>
                    )}
                  </div>
                )}


                {/* Unapproved Suggestions */}
              {/* Unapproved Suggestions - Show only before final name is selected */}
{!submission.selectedName && (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
    {submission.suggestions
      .filter((s) => !submission.suggestedToCustomer.includes(s.name))
      .map((s, idx) => (
        <div
          key={idx}
          className="p-3 rounded border border-red-400 bg-red-50"
        >
          <p>{s.name}</p>
          <p className="text-xs text-red-500 italic">Status: {s.status}</p>
        </div>
      ))}
  </div>
)}

              </>
            ) : (
              <p className="text-sm italic text-gray-500">
                Awaiting admin to review your name suggestions.
              </p>
            )}

            {/* Final Tracking Info */}
            {submission.customerSignedDocUrl && submission.trackingStatus && (
              <p className="text-sm text-gray-600 mt-2">
                <strong>Tracking Status:</strong> {submission.trackingStatus}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* RIGHT - Submit Names */}
      <div className="bg-white p-6 border rounded-lg shadow h-fit">
        <h2 className="text-lg font-semibold mb-4" style={{ color: primaryColor }}>
          Suggest Brand Names
        </h2>
        <form onSubmit={handleSubmitNames} className="space-y-3">
          {suggestedNames.map((name, index) => (
            <input
              key={index}
              type="text"
              value={name}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder={`Brand Name ${index + 1}`}
              required={index === 0}
              className="w-full px-3 py-2 border rounded"
              style={{ borderColor: primaryColor }}
            />
          ))}
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded mt-2"
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
