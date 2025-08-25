import React, { useEffect, useState } from "react";
import axios from "../api/Axios";
import { BASE_URL } from "../api/config";

// ✅ Status Badge with more states
const StatusBadge = ({ status }) => {
  const colors = {
    Pending: "bg-yellow-100 text-yellow-800",
    "Edits Sent": "bg-orange-100 text-orange-800",
    "Final Artwork Pending": "bg-blue-100 text-blue-800",
    "Final Product Pending": "bg-purple-100 text-purple-800",
    Approved: "bg-green-200 text-green-800",
    Completed: "bg-green-100 text-green-800",
    Default: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        colors[status] || colors.Default
      }`}
    >
      {status}
    </span>
  );
};

// ✅ Step Tracker
const StepIndicator = ({ submission }) => {
  const steps = [
    "Customer Selected Design",
    "Edits Sent",
    "Final Artwork Uploaded",
    "Final Product Uploaded",
    "Completed",
  ];

  let activeIndex = 0;

  if (submission.selectedFinalDesign) activeIndex = 1;
  if (submission.adminEditedDesigns?.length > 0) activeIndex = 2;
  if (submission.finalArtworkUrl) activeIndex = 3;
  if (submission.finalProductImages?.length > 0) activeIndex = 4;
  if (submission.status === "Completed") activeIndex = 5;
  if (activeIndex > steps.length - 1) activeIndex = steps.length - 1;

  return (
    <div className="flex items-center justify-between mb-4">
      {steps.map((step, idx) => (
        <div key={step} className="flex-1 flex items-center">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold
            ${
              idx < activeIndex
                ? "bg-[#d1383a] text-white"
                : idx === activeIndex
                ? "bg-[#d1383a] text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {idx + 1}
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`flex-1 h-1 ${
                idx < activeIndex ? "bg-[#d1383a]" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

// ✅ Next Step Instructions
const NextStep = ({ submission }) => {
  if (!submission) {
    return (
      <div className="p-3 bg-gray-100 border-l-4 border-[#d1383a] rounded">
        <p className="text-sm font-medium">📌 Next Step:</p>
        <p className="text-sm text-gray-700">Loading...</p>
      </div>
    );
  }

  let message = "Awaiting update...";

  if (submission.selectedDesignIds?.length > 0 && !submission.adminEditedDesigns?.length) {
    message = "✏️ Upload and send edited versions to customer.";
  } else if (submission.adminEditedDesigns?.length > 0 && !submission.selectedFinalDesign) {
    message = "⏳ Waiting for customer selection.";
  } else if (submission.selectedFinalDesign && !submission.finalArtworkUrl) {
    message = "🎨 Upload the final artwork (PDF/Image).";
  } else if (
    submission.finalArtworkUrl &&
    (submission.status === "Approved" || submission.status === "Final Product Pending") &&
    (!submission.finalProductImages || submission.finalProductImages.length === 0)
  ) {
    message = "📦 Upload final product images.";
  } else if (submission.finalProductImages?.length > 0) {
    message = "✅ No further action required.";
  }

  return (
    <div className="p-3 bg-gray-100 border-l-4 border-[#d1383a] rounded">
      <p className="text-sm font-medium">📌 Next Step:</p>
      <p className="text-sm text-gray-700">{message}</p>
    </div>
  );
};

const AdminPackingPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [finalArtwork, setFinalArtwork] = useState(null);
  const [editFiles, setEditFiles] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState("All");
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10;
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

  // ✅ Upload Handlers
  const handleSendEditsToCustomer = async () => {
    if (!selectedSubmission?._id || editFiles.length === 0) return;
    const formData = new FormData();
    editFiles.forEach((file) => formData.append("files", file));
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
      await axios.post(
        `/packing/final-artwork-upload/${selectedSubmission._id}`,
        formData
      );
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

  const handleUploadProductImages = async () => {
    if (!productImages.length || !selectedSubmission?._id) return;
    const formData = new FormData();
    productImages.forEach((file) => formData.append("productImages", file));
    try {
      setUploading(true);
      await axios.post(
        `/packing/final-product-upload/${selectedSubmission._id}`,
        formData
      );
      alert("Final product images uploaded.");
      setProductImages([]);
      fetchPending();
      setSelectedSubmission(null);
    } catch (err) {
      console.error("Product image upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  // ✅ Apply filter
  const filteredSubmissions =
    filter === "All"
      ? submissions
      : submissions.filter((s) => s.status === filter);

  const filterOptions = ["All", "Pending", "Final Artwork Pending", "Approved"];

  const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentItems = filteredSubmissions.slice(indexOfFirstItem, indexOfLastItem);

const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);

const handlePrevPage = () => {
  if (currentPage > 1) setCurrentPage(currentPage - 1);
};

const handleNextPage = () => {
  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
};
  return (
    <div className="max-w-7xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6 text-[#d1383a]">
        Manage Packing Design Submissions
      </h2>

      {/* ✅ Filter Buttons */}
      <div className="flex gap-3 mb-6">
        {filterOptions.map((opt) => (
          <button
            key={opt}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition 
              ${
                filter === opt
                  ? "bg-[#d1383a] text-white border-[#d1383a]"
                  : "bg-white text-[#d1383a] border-[#d1383a] hover:bg-[#d1383a]/10"
              }`}
            onClick={() => setFilter(opt)}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* ✅ Submissions Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-[#d1383a] text-white">
            <tr>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Selected Designs</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((s, idx) => (
              <tr
                key={s._id}
                className={`${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-gray-100 transition`}
              >
                <td className="px-4 py-3 border-t">{s.customerName || s.customerId}</td>
                <td className="px-4 py-3 border-t">
                  <StatusBadge status={s.status} />
                </td>
                <td className="px-4 py-3 border-t">
                  <div className="flex gap-2">
                    {(s.selectedDesignIds || []).map((design, idx) => (
                      <img
                        key={idx}
                        src={`${BASE_URL}${design.imageUrl}`}
                        alt={`Design ${idx + 1}`}
                        className="w-10 h-10 object-cover border rounded"
                      />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 border-t text-center">
                  <button
                    className="px-4 py-1 bg-[#d1383a] text-white rounded text-sm hover:bg-[#b52e31] transition"
                    onClick={() => setSelectedSubmission(s)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}

            {filteredSubmissions.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="text-center text-gray-500 py-6 italic"
                >
                  No submissions found for "{filter}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* ✅ Pagination Controls */}
{totalPages > 1 && (
  <div className="flex items-center justify-center gap-3 mt-4">
    <button
      onClick={handlePrevPage}
      disabled={currentPage === 1}
      className="px-3 py-1 border rounded disabled:opacity-50"
    >
      Prev
    </button>

    {[...Array(totalPages)].map((_, idx) => (
      <button
        key={idx + 1}
        onClick={() => setCurrentPage(idx + 1)}
        className={`px-3 py-1 rounded border ${
          currentPage === idx + 1
            ? "bg-[#d1383a] text-white border-[#d1383a]"
            : "bg-white text-[#d1383a] border-[#d1383a] hover:bg-[#d1383a]/10"
        }`}
      >
        {idx + 1}
      </button>
    ))}

    <button
      onClick={handleNextPage}
      disabled={currentPage === totalPages}
      className="px-3 py-1 border rounded disabled:opacity-50"
    >
      Next 
    </button>
  </div>
)}

      </div>

      {selectedSubmission && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
              onClick={() => setSelectedSubmission(null)}
            >
              ✖
            </button>

            <h3 className="text-xl font-semibold text-[#d1383a] mb-4">
              Submission Details
            </h3>

            {/* ✅ Step Progress */}
            {/* ✅ Step Progress */}
<StepIndicator submission={selectedSubmission} />


           <NextStep submission={selectedSubmission} />


            {/* ✅ Customer Selection */}
            <div className="mt-4">
              <p className="font-medium text-sm">✅ Selected by Customer</p>
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
                <p className="text-sm text-gray-400 italic">
                  No design selected yet.
                </p>
              )}
            </div>

            {/* ✅ Edits Sent */}
            {selectedSubmission.adminEditedDesigns?.length > 0 && (
              <div className="mt-4">
                <p className="font-medium text-sm">📨 Edits Sent to Customer</p>
                <div className="flex flex-wrap gap-3 mt-2">
                  {selectedSubmission.adminEditedDesigns.map((edit, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <img
                        src={`${BASE_URL}${edit.url}`}
                        alt={`Edit ${idx + 1}`}
                        className="w-20 h-20 object-cover rounded border"
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

            {/* ✅ Final Artwork */}
            {selectedSubmission.finalArtworkUrl && (
              <div className="mt-4">
                <p className="font-medium text-sm">🎨 Final Artwork Sent</p>
                {selectedSubmission.finalArtworkType === "pdf" ? (
                  <a
                    href={`${BASE_URL}/${selectedSubmission.finalArtworkUrl}`}
                    className="text-blue-600 underline"
                    download
                  >
                    Download PDF
                  </a>
                ) : (
                  <img
                    src={`${BASE_URL}/${selectedSubmission.finalArtworkUrl}`}
                    alt="Final"
                    className="w-24 mt-2 rounded border"
                  />
                )}
              </div>
            )}

            {/* ✅ Action Zone */}
            <div className="mt-6 p-4 border rounded bg-gray-50">
              <p className="font-medium text-sm mb-3">⚙️ Action Zone</p>

              {selectedSubmission.status === "Pending" && (
                <div>
                  <label className="block p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={(e) => setEditFiles(Array.from(e.target.files))}
                    />
                    <span className="text-gray-600">📂 Upload Edits</span>
                  </label>

                  {editFiles.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {editFiles.map((file, idx) => (
                        <img
                          key={idx}
                          src={URL.createObjectURL(file)}
                          className="w-16 h-16 rounded border object-cover"
                          alt={`Preview ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}

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
                  <label className="block p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      hidden
                      onChange={(e) => setFinalArtwork(e.target.files[0])}
                    />
                    <span className="text-gray-600">📂 Upload Final Artwork</span>
                  </label>

                  {finalArtwork && (
                    <p className="mt-2 text-sm text-gray-600">{finalArtwork.name}</p>
                  )}

                  <button
                    className="mt-3 bg-[#d1383a] text-white px-6 py-2 rounded"
                    onClick={handleUploadFinalArtwork}
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Upload Final Artwork"}
                  </button>
                </div>
              )}

              {["Approved", "Final Product Pending"].includes(selectedSubmission.status) && (
  <div>
    {/* Show already uploaded product images */}
    {selectedSubmission.finalProductImages?.length > 0 && (
  <div className="mb-4">
    <p className="font-medium text-sm">📸 Uploaded Product Images</p>
    <div className="flex flex-wrap gap-2 mt-2">
      {selectedSubmission.finalProductImages.map((img, idx) => (
        <div key={img._id || idx} className="flex flex-col items-center">
          <img
            src={`${BASE_URL}${img.url}`}   // ✅ FIXED
            className="w-20 h-20 rounded border object-cover"
            alt={`Product ${idx + 1}`}
          />
          <a
            href={`${BASE_URL}${img.url}`}   // ✅ FIXED
            className="text-xs mt-1 text-blue-600 underline"
            download
          >
            Download
          </a>
          <p className="text-[10px] text-gray-500">
            {new Date(img.uploadedAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  </div>
)}


    {/* Re-upload new product images */}
    <label className="block p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
      <input
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => setProductImages(Array.from(e.target.files))}
      />
      <span className="text-gray-600">
        {selectedSubmission.finalProductImages?.length > 0
          ? "📂 Re-upload Product Images"
          : "📂 Upload Product Images"}
      </span>
    </label>

    {productImages.length > 0 && (
      <div className="flex gap-2 mt-2">
        {productImages.map((file, idx) => (
          <img
            key={idx}
            src={URL.createObjectURL(file)}
            className="w-16 h-16 rounded border object-cover"
            alt={`Preview ${idx + 1}`}
          />
        ))}
      </div>
    )}

    <button
      className="mt-3 bg-green-600 text-white px-6 py-2 rounded"
      onClick={handleUploadProductImages}
      disabled={uploading}
    >
      {uploading
        ? "Uploading..."
        : selectedSubmission.finalProductImages?.length > 0
        ? "Re-upload Product Images"
        : "Upload Product Images"}
    </button>
  </div>
)}


              {selectedSubmission.rejectionReason && (
                <div className="mt-4 text-red-600 text-sm">
                  ❌ Rejected by Customer — {selectedSubmission.rejectionReason}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminPackingPage;
