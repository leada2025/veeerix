import React, { useState } from "react";

const FinalImageUploadModal = ({ suggestionId, onUpload, onClose }) => {
  const [files, setFiles] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (files.length > 0) {
      onUpload(suggestionId, files);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-lg font-semibold mb-4 text-[#7b4159]">
          Upload Final Images
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setFiles([...e.target.files])}
            className="mb-4"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1 rounded bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1 rounded bg-[#7b4159] text-white"
            >
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinalImageUploadModal;
