import React, { useEffect, useState } from "react";
import axios from "../api/Axios";
import SuggestionsTable from "../Components/SuggestionsTable";
import ApproveModal from "../Components/ApproveModal";
import DocumentUploadModal from "../Components/DocumentUploadModal";
import { Loader2, XCircle, CheckCircle } from "lucide-react";

const AdminTrademarkPage = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [finalized, setFinalized] = useState([]);
  const [selected, setSelected] = useState(null);
  const [uploadDocFor, setUploadDocFor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // ✅ Notification state
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000); // Auto-hide after 3s
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [all, finalizedRes] = await Promise.all([
        axios.get("/api/trademark"),
        axios.get("/api/trademark/finalized"),
      ]);
      setSuggestions(all.data || []);
      setFinalized(finalizedRes.data || []);
    } catch (err) {
      showNotification("Failed to load trademark data", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleApprove = async (id, approvedNames, remark) => {
    try {
      setActionLoading(true);
      await axios.post(`/api/trademark/${id}/approve`, { approvedNames, remark });
      showNotification("Suggestion approved successfully", "success");
      fetchAllData();
      setSelected(null);
    } catch (err) {
      showNotification("Approval failed", "error");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTrackStatusChange = async (id, status) => {
    try {
      await axios.put(`/api/trademark/${id}/status`, { status });
      showNotification("Status updated", "success");
      fetchAllData();
    } catch (err) {
      showNotification("Failed to update tracking status", "error");
    }
  };

  const handlePaymentToggle = async (id, status) => {
    try {
      await axios.put(`/api/trademark/${id}/payment`, { completed: status });
      showNotification(
        `Payment marked as ${status ? "Completed" : "Pending"}`,
        "success"
      );
      fetchAllData();
    } catch (err) {
      showNotification("Failed to update payment status", "error");
    }
  };

  const handleDocumentUpload = async (id, file) => {
    try {
      setActionLoading(true);
      const formData = new FormData();
      formData.append("adminDoc", file);
      await axios.post(`/api/trademark/${id}/upload-admin-doc`, formData);
      showNotification("Document uploaded successfully", "success");
      fetchAllData();
      setUploadDocFor(null);
    } catch (err) {
      showNotification("Document upload failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const pending = suggestions.filter(
    (s) =>
      (!s.approvedNames || s.approvedNames.length === 0) &&
      !s.selectedName &&
      (!s.trackingStatus || s.trackingStatus !== "Registered")
  );

  // 🔹 Simple Tabs Component (replaces headlessui)
  const [activeTab, setActiveTab] = useState("pending");

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] text-gray-500">
        <Loader2 className="animate-spin w-6 h-6 mr-2" />
        Loading data...
      </div>
    );
  }

  return (
    <div className="relative space-y-8 max-w-7xl min-h-screen  mx-auto overflow-hidden">

      <h1 className="text-3xl font-bold text-[#7b4159]">Trademark Admin Panel</h1>

      {/* ✅ Notification Banner */}
      {notification && (
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md ${
            notification.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* 🔹 Tabs Navigation */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg ${
            activeTab === "pending"
              ? "bg-[#7b4159] text-white"
              : "text-gray-600 hover:text-[#7b4159]"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setActiveTab("finalized")}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg ${
            activeTab === "finalized"
              ? "bg-[#7b4159] text-white"
              : "text-gray-600 hover:text-[#7b4159]"
          }`}
        >
          Finalized
        </button>
      </div>

      {/* 🔹 Tabs Content */}
      <div>
        {activeTab === "pending" && (
          pending.length > 0 ? (
            <SuggestionsTable
  data={pending}
  onSelect={handleApprove} // direct approve
/>

          ) : (
            <div className="text-gray-500 text-sm">No pending requests.</div>
          )
        )}

        {activeTab === "finalized" && (
          <SuggestionsTable
            data={finalized.filter((item) => item.trackingStatus !== "Registered")}
            isFinalized
            onTrackStatusChange={handleTrackStatusChange}
            onUploadDoc={setUploadDocFor}
            onTogglePayment={handlePaymentToggle}
          />
        )}
      </div>

      {/* Modals */}
     
      {uploadDocFor && (
        <DocumentUploadModal
          suggestionId={uploadDocFor}
          onUpload={handleDocumentUpload}
          onClose={() => setUploadDocFor(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default AdminTrademarkPage;
