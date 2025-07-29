import React, { useEffect, useState } from "react";
import axios from "../api/Axios";

const AdminAvailableDesignsPage = () => {
  const [designs, setDesigns] = useState([]);
  const [designFile, setDesignFile] = useState(null);
  const [label, setLabel] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchDesigns = async () => {
    try {
      const res = await axios.get("/packing/designs");
      setDesigns(res.data);
    } catch (err) {
      console.error("Failed to fetch designs:", err);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  const handleUpload = async () => {
    if (!designFile) return alert("Please select a design image");

    const formData = new FormData();
    formData.append("designFile", designFile);
    formData.append("label", label);

    try {
      setUploading(true);
      await axios.post("/packing/designs/upload", formData);
      setDesignFile(null);
      setLabel("");
      fetchDesigns(); // Refresh after upload
      alert("Design uploaded!");
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-6 text-[#d1383a]">Upload Available Packing Designs</h2>

      <div className="mb-6">
        <label className="block mb-2 font-medium">Label (optional)</label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full border px-3 py-2 mb-4 rounded"
          placeholder="e.g., Floral Pack, Classic Look"
        />
        <input type="file" accept="image/*" onChange={(e) => setDesignFile(e.target.files[0])} />
        <button
          className="mt-4 bg-[#d1383a] text-white px-6 py-2 rounded"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload Design"}
        </button>
      </div>

      <h3 className="font-semibold mb-4">Existing Designs</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {designs.map((design) => (
          <div key={design._id} className="border p-2 rounded text-center">
          <img
  src={`http://localhost:5000${design.imageUrl}`} // replace with production URL after deploy
  alt={design.label || "Design"}
  className="w-full h-32 object-cover rounded"
/>

            <p className="mt-2 text-sm text-gray-700">{design.label || "No label"}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminAvailableDesignsPage;
