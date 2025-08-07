import React, { useEffect, useState } from "react";
import axios from "../api/Axios";
import SuggestionsTable from "../Components/SuggestionsTable";
import ApproveModal from "../Components/ApproveModal";
import DocumentUploadModal from "../Components/DocumentUploadModal";
import PaymentToggle from "../Components/PaymentToggle";


const AdminTrademarkPage = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [finalized, setFinalized] = useState([]);
  const [selected, setSelected] = useState(null);
  const [uploadDocFor, setUploadDocFor] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      const [all, finalizedRes] = await Promise.all([
        axios.get("/api/trademark"),
        axios.get("/api/trademark/finalized"),
      ]);
      setSuggestions(all.data || []);
      setFinalized(finalizedRes.data || []);
    } catch (err) {
      console.error("Failed to load trademark data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleApprove = async (id, approvedNames, remark) => {
    try {
      await axios.post(`/api/trademark/${id}/approve`, {
        approvedNames,
        remark,
      });
      fetchAllData();
      setSelected(null);
    } catch (err) {
      console.error("Approval failed", err);
    }
  };

  const handleTrackStatusChange = async (id, status) => {
    try {
      await axios.put(`/api/trademark/${id}/status`, { status });
      fetchAllData();
    } catch (err) {
      console.error("Failed to update tracking status", err);
    }
  };

  const handlePaymentToggle = async (id, status) => {
    try {
      await axios.put(`/api/trademark/${id}/payment`, { completed: status });
      fetchAllData();
    } catch (err) {
      console.error("Failed to update payment status", err);
    }
  };

const handleDocumentUpload = async (id, file) => {
  try {
    const formData = new FormData();
    formData.append("adminDoc", file); // <-- updated here

    await axios.post(`/api/trademark/${id}/upload-admin-doc`, formData);
    fetchAllData();
    setUploadDocFor(null);
  } catch (err) {
    console.error("Document upload failed", err);
  }
};


  const pending = suggestions.filter(
    (s) =>
      (!s.approvedNames || s.approvedNames.length === 0) &&
      !s.selectedName &&
      (!s.trackingStatus || s.trackingStatus !== "Registered")
  );

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;

  return (
    <div className="p-6 space-y-10 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-[#d1383a] mb-10">
        Trademark Admin Panel
      </h1>

      <Section title="Pending Submissions">
        {pending.length > 0 ? (
          <SuggestionsTable data={pending} onSelect={setSelected} />
        ) : (
          <div className="text-gray-500 text-sm">No pending requests.</div>
        )}
      </Section>

      <Section title="Finalized Suggestions">
        <SuggestionsTable
          data={finalized.filter((item) => item.trackingStatus !== "Registered")}
          isFinalized
          onTrackStatusChange={handleTrackStatusChange}
          onUploadDoc={setUploadDocFor}
          onTogglePayment={handlePaymentToggle}
        />
      </Section>

      {selected && (
        <ApproveModal
          suggestion={selected}
          onClose={() => setSelected(null)}
          onApprove={handleApprove}
        />
      )}

      {uploadDocFor && (
        <DocumentUploadModal
          suggestionId={uploadDocFor}
          onUpload={handleDocumentUpload}
          onClose={() => setUploadDocFor(null)}
        />
      )}
    </div>
  );
};

const Section = ({ title, children }) => (
  <div>
    <h2 className="text-xl font-semibold mb-4 text-[#d1383a]">{title}</h2>
    {children}
  </div>
);

export default AdminTrademarkPage;
