import React, { useEffect, useState } from "react";
import axios from "../api/Axios";
import { BASE_URL } from "../api/config";

const AdminPackingPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [finalArtwork, setFinalArtwork] = useState(null);
  const [editFiles, setEditFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await axios.get("/packing/submitted?mode=pending");
      setSubmissions(res.data);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  };

  const handleSendEditsToCustomer = async () => {
    if (!selectedSubmission?._id || editFiles.length === 0) return;

    const formData = new FormData();
    editFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      await axios.post(`/packing/send-edits/${selectedSubmission._id}`, formData);
      alert("Edits sent to customer.");
      fetchPending();
      setSelectedSubmission(null);
      setEditFiles([]);
    } catch (err) {
      console.error("Send failed:", err);
      alert("Error sending edited files.");
    }
  };

  const handleUploadFinalArtwork = async () => {
    if (!finalArtwork || !selectedSubmission?._id) return;

    const formData = new FormData();
    formData.append("file", finalArtwork);

    try {
      setUploading(true);
      await axios.post(`/packing/final-artwork-upload/${selectedSubmission._id}`, formData);
      alert("Final artwork uploaded.");
      setFinalArtwork(null);
      fetchPending();
      setSelectedSubmission(null);
    } catch (err) {
      console.error("Final artwork upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6 text-[#d1383a]">Manage Packing Design Submissions</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sidebar List */}
        <div>
          <h3 className="font-semibold mb-2">Pending Submissions</h3>
          <ul className="space-y-3">
            {submissions.map((s) => (
              <li
                key={s._id}
                className={`p-3 border rounded cursor-pointer ${
                  selectedSubmission?._id === s._id ? "border-[#d1383a]" : "border-gray-300"
                }`}
                onClick={() => setSelectedSubmission(s)}
              >
                <div>
                  <span className="font-medium">Customer:</span>{" "}
                  {s.customerName || s.customerId}
                </div>
                <div>Status: {s.status}</div>
                <div className="flex gap-2 mt-2">
                  {(s.selectedDesignIds || []).map((design, idx) => (
                    <img
                      key={idx}
                      src={`${BASE_URL}${design.imageUrl}`}
                      alt={`Design ${idx + 1}`}
                      className="w-16 h-16 object-cover border"
                    />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Details View */}
        <div>
          {selectedSubmission && (
            <div className="border p-4 rounded bg-gray-50 space-y-4">
              <h3 className="font-semibold text-lg text-[#d1383a]">Manage Submission</h3>

              {/* 1. Selected by Customer */}
              <div>
                <p className="text-sm font-medium">✅ Selected by Customer</p>
                {selectedSubmission.selectedFinalDesign ? (
                  <div className="flex items-center gap-4 mt-2">
                    <img
                      src={`${BASE_URL}${
                        typeof selectedSubmission.selectedFinalDesign === "string"
                          ? selectedSubmission.selectedFinalDesign
                          : selectedSubmission.selectedFinalDesign.imageUrl
                      }`}
                      alt="Selected"
                      className="w-24 h-24 object-cover border rounded"
                    />
                    <a
                      href={`${BASE_URL}${
                        typeof selectedSubmission.selectedFinalDesign === "string"
                          ? selectedSubmission.selectedFinalDesign
                          : selectedSubmission.selectedFinalDesign.imageUrl
                      }`}
                      className="text-blue-600 underline"
                      download
                    >
                      Download
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No design selected yet.</p>
                )}
              </div>

              {/* 2. Admin-Edited Designs (History) */}
              {selectedSubmission.adminEditedDesigns?.length > 0 && (
                <div>
                  <p className="text-sm font-medium">📨 Edits Sent to Customer</p>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {selectedSubmission.adminEditedDesigns.map((edit, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <img
                          src={`${BASE_URL}${edit.url}`}
                          alt={`Edit ${idx + 1}`}
                          className="w-24 h-24 object-cover rounded border"
                        />
                        <a
                          href={`${BASE_URL}${edit.url}`}
                          className="text-xs mt-1 text-blue-600 underline"
                          download
                        >
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Final Artwork Sent */}
              {selectedSubmission.finalArtworkUrl && (
                <div>
                  <p className="text-sm font-medium">🎨 Final Artwork Sent</p>
                  {selectedSubmission.finalArtworkType === "pdf" ? (
                    <a
                      href={`${BASE_URL}/${selectedSubmission.finalArtworkUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                      download
                    >
                      Download PDF
                    </a>
                  ) : (
                    <div className="flex items-center gap-4 mt-2">
                      <img
                        src={`${BASE_URL}/${selectedSubmission.finalArtworkUrl}`}
                        className="w-24 rounded border"
                        alt="Final"
                      />
                      <a
                        href={`${BASE_URL}/${selectedSubmission.finalArtworkUrl}`}
                        className="text-blue-600 underline"
                        download
                      >
                        Download
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* 4. Admin Action Zone */}
              {selectedSubmission.status === "Pending" && (
                <div>
                  <label className="block font-medium mb-1">Upload Admin Edits</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setEditFiles(Array.from(e.target.files))}
                  />
                  <button
                    className="mt-3 bg-[#d1383a] text-white px-6 py-2 rounded"
                    onClick={handleSendEditsToCustomer}
                  >
                    Send Edits to Customer
                  </button>
                </div>
              )}

              {selectedSubmission.status === "Final Artwork Pending" && (
                <div>
                  <label className="block font-medium mb-1">Upload Final Artwork</label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setFinalArtwork(e.target.files[0])}
                  />
                  <button
                    className="mt-3 bg-[#d1383a] text-white px-6 py-2 rounded"
                    onClick={handleUploadFinalArtwork}
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Send Final Artwork"}
                  </button>
                </div>
              )}

              {/* 5. Rejection Info */}
             {selectedSubmission.status === "Final Artwork Pending" &&
  selectedSubmission.rejectionReason && (
    <div className="mt-4">
      <p className="text-sm text-red-600 font-medium">
        ❌ Rejected by Customer
      </p>
      <p className="text-sm italic">Reason: {selectedSubmission.rejectionReason}</p>
    </div>
)}

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPackingPage;
