import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/Axios";
import { BASE_URL } from "../api/config";
import TrademarkStatusTracker from "./TrademarkStatusTracker";

const primaryColor = "#7b4159";
const stages = [
  "Suggested Brand Name",
  "Select Brand Name",
  "Payment",
  "Download Document",
  "Upload Signed Document",
];

const RequestDetails = () => {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [files, setFiles] = useState({});
  const [activeStage, setActiveStage] = useState(() => {
    const savedStage = localStorage.getItem("activeStage_" + id);
    return savedStage !== null ? parseInt(savedStage, 10) : 0;
  });

  const handleStageClick = (i) => {
    setActiveStage(i);
    localStorage.setItem("activeStage_" + id, i);
  };

  useEffect(() => {
    if (id) fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return console.error("No user found in localStorage");
      const userId = JSON.parse(storedUser)?._id || JSON.parse(storedUser)?.id;
      if (!userId) return console.error("Invalid user object");

      const res = await axios.get(`/api/trademark/${userId}`);
      const requests = res.data || [];
      const req = requests.find((r) => r._id === id);
      if (!req) return console.error("Request not found for this ID");

      setSubmission(req);
      const savedStage = localStorage.getItem("activeStage_" + id);
      setActiveStage(savedStage ? Number(savedStage) : getCompletedStageIndex(req));
    } catch (err) {
      console.error("Error fetching request:", err);
    }
  };

  const handleSelectFinalName = async (name) => {
    try {
      await axios.post(`/api/trademark/${id}/finalize`, { selectedName: name });
      fetchRequest();
    } catch (err) {
      console.error("Error selecting final name:", err);
    }
  };

  const handlePayment = async () => {
    try {
      await axios.post(`/api/trademark/${id}/payment`);
      fetchRequest();
    } catch (err) {
      console.error("Payment failed:", err);
    }
  };

  const handleCustomerDocUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("signedDoc", files[id]);
    try {
      await axios.post(`/api/trademark/${id}/upload-signed-doc`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFiles((prev) => ({ ...prev, [id]: null }));
      fetchRequest();
    } catch (err) {
      console.error("Document upload failed:", err);
    }
  };

  if (!submission) {
    return (
      <div className="text-center py-16 text-gray-500 font-medium text-lg">
        Loading request details...
      </div>
    );
  }

  const pendingNames = submission.suggestions
    ?.map((s) => s.name)
    .filter(
      (name) =>
        !submission.suggestedToCustomer?.includes(name) &&
        !submission.rejectedNames?.includes(name)
    );

  return (
    <div className="max-w-6xl mx-auto mt-12 space-y-10 px-6">
      <h2 className="text-4xl font-bold text-center" style={{ color: primaryColor }}>
        Trademark Request Details
      </h2>

      {/* Stepper */}
      <div className="relative flex items-center justify-between mt-10 mb-10">
        {stages.map((stage, i) => {
          const completedIndex = getCompletedStageIndex(submission);
          const isCompleted = i < completedIndex;
          const isActive = i === completedIndex && completedIndex < stages.length;

          return (
            <div key={i} className="flex-1 flex flex-col items-center relative">
              {/* Circle */}
              <div
                className={`w-12 h-12 flex items-center justify-center rounded-full text-white font-semibold shadow-lg cursor-pointer transition-all`}
                style={{
                  backgroundColor: isCompleted
                    ? "#22c55e"
                    : isActive
                    ? primaryColor
                    : "#d1d5db",
                  transform: isActive ? "scale(1.2)" : "scale(1)",
                }}
                onClick={() => handleStageClick(i)}
              >
                {i + 1}
              </div>

              {/* Label */}
              <span
                className={`mt-2 text-center text-sm font-medium ${
                  isCompleted ? "text-green-700" : isActive ? "text-primary" : "text-gray-400"
                }`}
                style={{ color: isActive ? primaryColor : undefined }}
              >
                {stage}
              </span>

              {/* Connector */}
              {i < stages.length - 1 && (
                <div
                  className="absolute top-6 left-1/2 w-full h-1 -z-10 transform -translate-x-1/2"
                  style={{
                    background: `linear-gradient(to right, ${
                      isCompleted ? "#22c55e" : "#d1d5db"
                    } 50%, transparent 50%)`,
                  }}
                ></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stage Content */}
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 space-y-8">
        {/* Stage 0 */}
        {activeStage === 0 && (
          <StageBlock title="Your Suggested Brand Names">
            {submission.suggestions?.map((s, idx) => (
              <p key={idx} className="text-sm mb-2">
                {s.name} —{" "}
                <span className="italic text-gray-500">{s.status}</span>
              </p>
            ))}
          </StageBlock>
        )}

        {/* Stage 1 */}
        {activeStage === 1 && (
          <StageBlock title="Admin Reviewed Names">
            {submission.suggestedToCustomer?.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-3">
                {submission.suggestedToCustomer.map((name, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      !submission.selectedName && handleSelectFinalName(name)
                    }
                    className={`px-5 py-2 rounded-lg text-white font-medium transition-colors ${
                      submission.selectedName === name
                        ? "bg-gray-400 cursor-not-allowed"
                        : `bg-gradient-to-r from-${primaryColor} to-${primaryColor} hover:opacity-90`
                    }`}
                    disabled={!!submission.selectedName}
                    style={{
                      backgroundColor:
                        submission.selectedName === name ? "#a1a1a1" : primaryColor,
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}

            {pendingNames?.length > 0 && (
              <div className="mt-2">
                {pendingNames.map((name, idx) => (
                  <p key={idx} className="text-red-700 italic mb-1">
                    {name} — Unavailable
                  </p>
                ))}
              </div>
            )}

            {submission.rejectedNames?.length > 0 && (
              <div className="mt-2">
                <p className="font-medium text-red-600 mb-1">Rejected Names:</p>
                {submission.rejectedNames.map((name, idx) => (
                  <p key={idx} className="text-sm text-red-500 italic mb-1">
                    {name} — Not available
                  </p>
                ))}
              </div>
            )}

            {submission.selectedName && (
              <p className="text-green-600 font-semibold mt-3">
                Final Name Selected: <strong>{submission.selectedName}</strong>
              </p>
            )}

            {!submission.suggestedToCustomer?.length &&
              !submission.selectedName &&
              !submission.rejectedNames?.length && (
                <p className="text-gray-500 italic">Awaiting admin review...</p>
              )}
          </StageBlock>
        )}

        {/* Stage 2 */}
        {activeStage === 2 && (
          <StageBlock title="Payment">
            {submission.selectedName ? (
              !submission.paymentCompleted ? (
                <button
                  onClick={handlePayment}
                  className="px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-purple-600 hover:to-pink-500 transition-colors"
                >
                  Pay ₹1500
                </button>
              ) : (
                <p className="text-green-600 font-medium">
                  Payment completed ✅
                </p>
              )
            ) : (
              <p className="text-gray-500 italic">Select a name before payment.</p>
            )}
          </StageBlock>
        )}

        {/* Stage 3 */}
        {activeStage === 3 && (
          <StageBlock title="Download Document">
            {submission.paymentCompleted ? (
              submission.adminDocumentUrl ? (
                <a
                  href={`${BASE_URL}/${submission.adminDocumentUrl?.replace(/^\/+/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:opacity-90 transition"
                >
                  Download Legal Document
                </a>
              ) : (
                <p className="text-gray-500 italic">
                  Awaiting admin to upload the document.
                </p>
              )
            ) : (
              <p className="text-gray-500 italic">Complete payment first.</p>
            )}
          </StageBlock>
        )}

        {/* Stage 4 */}
        {activeStage === 4 && (
          <StageBlock title="Upload Signed Document">
            {submission.adminDocumentUrl ? (
              submission.customerSignedDocUrl ? (
                <p className="text-green-600 font-medium">
                  Signed document uploaded ✅
                </p>
              ) : (
                <form
                  onSubmit={handleCustomerDocUpload}
                  className="flex flex-col gap-3 mt-2"
                >
                  <input
                    type="file"
                    accept="application/pdf"
                    required
                    onChange={(e) => setFiles({ [id]: e.target.files[0] })}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-white font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 transition"
                  >
                    Upload Signed Document
                  </button>
                </form>
              )
            ) : (
              <p className="text-gray-500 italic">Download document first.</p>
            )}

            {submission.trackingStatus && (
              <div className="mt-6 p-4 border rounded-2xl bg-gray-50">
                <h4 className="font-semibold mb-2" style={{ color: primaryColor }}>
                  Trademark Tracking
                </h4>
                <TrademarkStatusTracker
                  currentStatus={submission.trackingStatus}
                  highlightColor={primaryColor}
                />
                <p className="mt-2 text-sm text-gray-600">
                  Current Status:{" "}
                  <span className="font-medium" style={{ color: primaryColor }}>
                    {submission.trackingStatus}
                  </span>
                </p>
              </div>
            )}
          </StageBlock>
        )}
      </div>
    </div>
  );
};

function StageBlock({ title, children }) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}

function getCompletedStageIndex(sub) {
  if (sub.customerSignedDocUrl) return stages.length;
  if (sub.adminDocumentUrl) return 3;
  if (sub.paymentCompleted) return 2;
  if (sub.selectedName) return 2;
  if (sub.suggestedToCustomer?.length > 0) return 1;
  return 0;
}

export default RequestDetails;
