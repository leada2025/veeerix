import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/Axios";
import { BASE_URL } from "../api/config";
import { Link } from "react-router-dom";

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
  const [activeStage, setActiveStage] = useState(0);

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
      setActiveStage(getCompletedStageIndex(req));
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
      <div className="text-center py-10 text-gray-500">
        Loading request details...
      </div>
    );
  }
const pendingNames = submission.suggestions
  ?.map(s => s.name)
  .filter(
    (name) =>
      !submission.suggestedToCustomer?.includes(name) &&
      !submission.rejectedNames?.includes(name)
  );
  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-6 px-4">
      <h2 className="text-3xl font-bold" style={{ color: primaryColor }}>
        Trademark Request Details
      </h2>

      {/* Stepper */}
      <div className="flex justify-between items-center relative">
        {stages.map((stage, i) => {
          const completedIndex = getCompletedStageIndex(submission);
          const isCompleted = i < completedIndex;
          const isActive = i === completedIndex;

          return (
            <div
              key={i}
              className="flex flex-col items-center flex-1"
              onClick={() => setActiveStage(i)}
            >
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold cursor-pointer shadow`}
                style={{
                  backgroundColor: isCompleted
                    ? primaryColor
                    : isActive
                    ? "#f59e0b"
                    : "#d1d5db",
                }}
              >
                {i + 1}
              </div>
              <p
                className={`mt-2 text-sm font-medium text-center ${
                  isCompleted
                    ? "text-green-700"
                    : isActive
                    ? "text-yellow-700"
                    : "text-gray-400"
                }`}
              >
                {stage}
              </p>
              {i < stages.length - 1 && (
                <div
                  className="absolute top-4 left-0 right-0 h-1"
                  style={{
                    background: `linear-gradient(to right, ${
                      isCompleted ? primaryColor : "#d1d5db"
                    } 50%, transparent 50%)`,
                    zIndex: -1,
                  }}
                ></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stage Content */}
      <div className="p-6 rounded-lg shadow bg-white border border-gray-200">
        {activeStage === 0 && (
          <StageBlock title="Your Suggested Brand Names">
            {submission.suggestions?.map((s, idx) => (
              <p key={idx} className="text-sm mb-1">
                {s.name} —{" "}
                <span className="italic text-gray-500">{s.status}</span>
              </p>
            ))}
          </StageBlock>
        )}
{activeStage === 1 && (
  <StageBlock title="Admin Reviewed Names">
    {/* Approved Names */}
    {submission.suggestedToCustomer?.length > 0 && (
      <div className="mb-3">
        <p className="font-medium text-green-700 mb-1">Approved Names:</p>
        {submission.suggestedToCustomer.map((name, idx) => (
          <button
            key={idx}
            onClick={() => !submission.selectedName && handleSelectFinalName(name)}
            className={`mt-1 px-4 py-2 rounded ml-3 text-white ${
              submission.selectedName === name
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
            disabled={!!submission.selectedName}
          >
            {name}
          </button>
        ))}
      </div>
    )}

    {/* Pending / Not Approved Names */}
    {pendingNames?.length > 0 && (
      <div className="mt-2">
      
        {pendingNames.map((name, idx) => (
          <p key={idx} className="text-md text-red-700 italic mb-1">
            {name} — Unavailabled names
          </p>
        ))}
      </div>
    )}

    {/* Rejected Names */}
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

    {/* Final Selected Name */}
    {submission.selectedName && (
      <p className="text-green-600 font-medium mt-3">
        Final Name Selected: <strong>{submission.selectedName}</strong>
      </p>
    )}

    {/* Awaiting admin review */}
    {!submission.suggestedToCustomer?.length &&
      !submission.selectedName &&
      !submission.rejectedNames?.length && (
        <p className="text-gray-500 italic">Awaiting admin review...</p>
      )}
  </StageBlock>
)}

        {activeStage === 2 && (
          <StageBlock title="Payment">
            {submission.selectedName ? (
              !submission.paymentCompleted ? (
                <button
                  onClick={handlePayment}
                  className="px-5 py-2 rounded text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  Pay ₹1500
                </button>
              ) : (
                <p className="text-green-600 font-medium">
                  Payment completed ✅
                </p>
              )
            ) : (
              <p className="text-gray-500 italic">
                Select a name before payment.
              </p>
            )}
          </StageBlock>
        )}

        {activeStage === 3 && (
          <StageBlock title="Download Document">
            {submission.paymentCompleted ? (
              submission.adminDocumentUrl ? (
                <a
                  href={`${BASE_URL}/${submission.adminDocumentUrl?.replace(/^\/+/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                  style={{ color: primaryColor }}
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

    {activeStage === 4 && (
  <StageBlock title="Upload Signed Document">
    {submission.adminDocumentUrl ? (
      submission.customerSignedDocUrl ? (
        <>
          <p className="text-green-600 font-medium">
            Signed document uploaded ✅
          </p>
               <Link
  to="/trademarks/track"
  className="mt-4 inline-block px-4 py-2 rounded text-white"
  style={{ backgroundColor: primaryColor }}
>
  View Trackline
</Link>
        </>
      ) : (
        <>
          <form onSubmit={handleCustomerDocUpload} className="space-y-2">
            <input
              type="file"
              accept="application/pdf"
              required
              onChange={(e) => setFiles({ [id]: e.target.files[0] })}
              className="block border border-gray-300 rounded px-3 py-2"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded text-white"
              style={{ backgroundColor: primaryColor }}
            >
              Upload Signed Document
            </button>
          </form>
          <a
            href={`/tracking/track`}
            className="mt-4 inline-block px-4 py-2 rounded text-white"
            style={{ backgroundColor: primaryColor }}
          >
            View Trackline
          </a>
        </>
      )
    ) : (
      <>
        <p className="text-gray-500 italic">Download document first.</p>
       <Link
  to="/trademarks/track"
  className="mt-4 inline-block px-4 py-2 rounded text-white"
  style={{ backgroundColor: primaryColor }}
>
  View Trackline
</Link>
      </>
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
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}

function getCompletedStageIndex(sub) {
  if (sub.customerSignedDocUrl) return 4; // max index = 4
  if (sub.adminDocumentUrl) return 3;
  if (sub.paymentCompleted) return 2;
  if (sub.selectedName) return 1;
  if (sub.suggestedToCustomer?.length > 0) return 0;
  return 0;
}


export default RequestDetails;
