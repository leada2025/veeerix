import React, { useEffect, useState } from "react";
import axios from "../api/Axios";

const AdminPackingPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [finalDesign, setFinalDesign] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await axios.get("/packing/submitted");
        setSubmissions(res.data);
      } catch (err) {
        console.error("Error fetching submissions:", err);
      }
    };

    fetchSubmissions();
  }, []);

  const handleUpload = async () => {
  if (!finalDesign || !selectedSubmission) return;

  const formData = new FormData();
  formData.append("finalDesign", finalDesign);
  formData.append("customerId", selectedSubmission.customerId._id || selectedSubmission.customerId);

  try {
    setUploading(true);
    await axios.post("/packing/upload-admin", formData);
    alert("Final design sent to customer.");
    setFinalDesign(null);
    setSelectedSubmission(null);
    
    // ✅ FIXED refresh:
    const res = await axios.get("/packing/submitted?mode=pending");
    setSubmissions(res.data);
  } catch (err) {
    console.error("Upload error:", err);
    alert("Upload failed.");
  } finally {
    setUploading(false);
  }
};


  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-6 text-[#d1383a]">Finalize Packing Designs</h2>

      {/* Submissions list */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Pending Submissions</h3>
        <ul className="space-y-2">
          {submissions.map((s) => (
            <li
              key={s._id}
              className={`p-3 border rounded cursor-pointer ${
                selectedSubmission?._id === s._id ? "border-[#d1383a]" : "border-gray-300"
              }`}
              onClick={() => setSelectedSubmission(s)}
            >
            Customer: {s.customerName || s.customerId} <br />
Design: {s.selectedDesign?.label}
{ s.selectedDesign?.imageUrl && (
  <img
    src={`https://veeerix.onrender.com${s.selectedDesign.imageUrl}`}
    alt="Selected Design"
    className="mt-2 w-32 h-32 object-cover border"
  />
)}

            </li>
          ))}
        </ul>
      </div>

      {/* Upload section */}
      {selectedSubmission && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Upload Final Design</h3>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFinalDesign(e.target.files[0])}
          />
          <button
            className="mt-4 bg-[#d1383a] text-white px-6 py-2 rounded"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Send to Customer"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminPackingPage;
