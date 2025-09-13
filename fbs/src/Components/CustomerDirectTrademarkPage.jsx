// src/pages/CustomerDirectTrademarkPage.jsx
import React, { useEffect, useState } from "react";
import axios from "../api/Axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  PlusCircle,
  Loader2,
  Award,
  Edit2,
  Trash2,
  LayoutGrid,
  Kanban,
  X,
} from "lucide-react";
import { motion } from "framer-motion";

const TRADEMARK_STAGES = [
  "New Application / New",
  "Send to Vienna Codification",
  "Formalities Check (Pass / Fail)",
  "Marked for Exam",
  "Examination Report Issued / Objected",
  "Ready for Show Cause Hearing",
  "Accepted & Advertised / Advertised before Accepted",
  "Opposed",
  "Registered",
  "Renewal Due / Expired",
];

const CustomerDirectTrademarkPage = () => {
  const [finalizedTrademarks, setFinalizedTrademarks] = useState([]);
  const [newTrademark, setNewTrademark] = useState("");
  const [selectedMolecule, setSelectedMolecule] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editMolecule, setEditMolecule] = useState("");
  const [editStage, setEditStage] = useState("");
  const [molecules, setMolecules] = useState([]);
  const [viewMode, setViewMode] = useState("gallery");
  const [showAddModal, setShowAddModal] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const user = JSON.parse(localStorage.getItem("user"));
  const customerId = user?.id;

  useEffect(() => {
    if (customerId) {
      fetchFinalized();
      axios.get(`/packing/molecules/${customerId}`).then((res) => {
        setMolecules(res.data || []);
      });
    }
  }, [customerId]);

  const fetchFinalized = async () => {
    try {
      const res = await axios.get(`/api/trademark/finalized/${customerId}`);
      setFinalizedTrademarks(res.data || []);
    } catch (err) {
      console.error("Failed to fetch finalized trademarks", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrademark = async (e) => {
    e.preventDefault();
    if (!newTrademark.trim() || !selectedMolecule || !selectedStage) {
      alert("Please enter a trademark, molecule, and select a stage.");
      return;
    }
    setAdding(true);

    try {
      await axios.post("/api/trademark/direct", {
        customerId,
        name: newTrademark.trim(),
        brandName: selectedMolecule,
        trackingStatus: selectedStage,
      });

      setNewTrademark("");
      setSelectedMolecule("");
      setSelectedStage("");
      setShowAddModal(false);
      fetchFinalized();
    } catch (err) {
      console.error("Failed to add new trademark", err);
      alert("Failed to add trademark.");
    } finally {
      setAdding(false);
    }
  };

  const handleEdit = async (id) => {
    if (!editValue.trim() || !editMolecule || !editStage) {
      alert("Please enter trademark, molecule, and stage.");
      return;
    }
    try {
      await axios.put(`/api/trademark/direct/${id}`, {
        name: editValue.trim(),
        brandName: editMolecule,
        trackingStatus: editStage,
      });
      setEditingId(null);
      setEditValue("");
      setEditMolecule("");
      setEditStage("");
      fetchFinalized();
    } catch (err) {
      console.error("Failed to edit trademark", err);
      alert("Failed to edit trademark.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this trademark?"))
      return;
    try {
      await axios.delete(`/api/trademark/direct/${id}`);
      fetchFinalized();
    } catch (err) {
      console.error("Failed to delete trademark", err);
      alert("Failed to delete trademark.");
    }
  };

  // Pagination helpers
  const totalPages = Math.ceil(finalizedTrademarks.length / itemsPerPage);
  const paginatedData = finalizedTrademarks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-6xl mx-auto p-6 mt-10">
      {/* Header with toggle + Add button */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-[#7b4159] border-b-2 border-gray-200 pb-3">
          My Trademarks
        </h2>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("gallery")}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg border-[#7b4159] border ${
              viewMode === "gallery"
                ? "bg-[#7b4159] text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            <LayoutGrid size={16} /> Gallery
          </button>
          <button
            onClick={() => setViewMode("kanban")}
            className={`flex items-center gap-1 px-3 py-2 border border-[#7b4159] rounded-lg ${
              viewMode === "kanban"
                ? "bg-[#7b4159] text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Kanban size={16} /> Kanban
          </button>

          {/* Add Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[#7b4159] text-[#7b4159] hover:bg-[#69384d] hover:text-white transition"
          >
            <PlusCircle size={16} /> Add
          </button>
        </div>
      </div>

      {/* Loading / empty / views */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-[#7b4159]" size={32} />
          <span className="ml-3 text-gray-600 text-lg">Loading...</span>
        </div>
      ) : finalizedTrademarks.length === 0 ? (
        <div className="text-center text-gray-500 py-16">
          <Award size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-xl font-medium mb-2">No finalized trademarks yet</p>
          <p className="text-gray-500">
            Once you register, your trademarks will appear here.
          </p>
        </div>
      ) : viewMode === "gallery" ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
            {paginatedData.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition"
              >
                {editingId === item._id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="border border-gray-300 px-3 py-2 rounded-lg w-full"
                    />
                    <input
                      type="text"
                      value={editMolecule}
                      onChange={(e) => setEditMolecule(e.target.value)}
                      placeholder="Enter molecule"
                      className="border border-gray-300 px-3 py-2 rounded-lg w-full"
                    />
                    <select
                      value={editStage}
                      onChange={(e) => setEditStage(e.target.value)}
                      className="border border-gray-300 px-3 py-2 rounded-lg w-full"
                    >
                      <option value="">Select Stage</option>
                      {TRADEMARK_STAGES.map((s, idx) => (
                        <option key={idx} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 text-sm text-gray-600 hover:underline"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleEdit(item._id)}
                        className="px-3 py-1 text-sm bg-[#7b4159] text-white rounded-lg"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Award className="text-[#7b4159]" size={24} />
                        <p className="text-lg font-semibold text-gray-800">
                          {item.selectedName}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setEditingId(item._id);
                            setEditValue(item.selectedName);
                            setEditMolecule(item.selectedBrandName || "");
                            setEditStage(item.trackingStatus  || "");
                          }}
                          className="text-[#7b4159] hover:text-[#371d28]"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="text-[#7b4159] hover:text-[#371d28]"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    {item.selectedBrandName && (
                      <p className="ml-8 text-sm text-gray-600">
                        Molecule: {item.selectedBrandName}
                      </p>
                    )}
                    {item.status && (
                      <p className="ml-8 text-sm text-gray-500">
                        Status: {item.trackingStatus}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-lg disabled:opacity-50"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded-lg ${
                    currentPage === i + 1
                      ? "bg-[#7b4159] text-white"
                      : "border text-gray-700"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : viewMode === "kanban" && (
  <DragDropContext
    onDragEnd={async (result) => {
      if (!result.destination) return;

      const { draggableId, destination } = result;
      const newStage = destination.droppableId;

      try {
        await axios.put(`/api/trademark/direct/${draggableId}`, {
          trackingStatus: newStage,
        });
        fetchFinalized();
      } catch (err) {
        console.error("Failed to update stage", err);
        alert("Error: could not update stage");
      }
    }}
  >
    <div className="overflow-x-auto">
      <div className="grid grid-flow-col auto-cols-max gap-4">
        {TRADEMARK_STAGES.map((stage) => (
          <Droppable key={stage} droppableId={stage}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`bg-gray-50 rounded-xl border min-w-[250px] p-4 flex flex-col transition-colors ${
                  snapshot.isDraggingOver ? "bg-purple-50 border-[#7b4159]" : "border-gray-200"
                }`}
              >
                {/* Column Header */}
                <h3 className="font-semibold text-gray-700 mb-3 border-b pb-2">{stage}</h3>

                {/* Draggable Items */}
                {finalizedTrademarks
                  .filter((t) => t.trackingStatus === stage)
                  .map((item, index) => (
                    <Draggable key={item._id} draggableId={item._id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-white rounded-lg shadow p-3 mb-3 transition ${
                            snapshot.isDragging ? "ring-2 ring-[#7b4159]" : ""
                          }`}
                        >
                          <p className="font-medium text-gray-800">{item.selectedName}</p>
                          {item.selectedBrandName && (
                            <p className="text-xs text-gray-500">
                              Molecule: {item.selectedBrandName}
                            </p>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </div>
  </DragDropContext>
)}


      {/* Popup Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-lg relative">
            {/* Close Button */}
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-semibold text-[#7b4159] mb-4">
              Add New Trademark
            </h3>

            <form onSubmit={handleAddTrademark} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Enter new registered trademark"
                className="border border-gray-300 px-4 py-3 rounded-xl w-full"
                value={newTrademark}
                onChange={(e) => setNewTrademark(e.target.value)}
              />
              <input
                type="text"
                placeholder="Enter molecule name"
                className="border border-gray-300 px-4 py-3 rounded-xl w-full"
                value={selectedMolecule}
                onChange={(e) => setSelectedMolecule(e.target.value)}
              />
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="border border-gray-300 px-4 py-3 rounded-xl w-full"
              >
                <option value="">Select Trademark Stage</option>
                {TRADEMARK_STAGES.map((s, idx) => (
                  <option key={idx} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={adding}
                className="flex items-center justify-center gap-2 bg-[#7b4159] text-white px-5 py-3 rounded-xl font-medium hover:bg-[#69384d] transition disabled:opacity-50"
              >
                {adding ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <PlusCircle size={18} />
                )}
                {adding ? "Adding..." : "Add"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDirectTrademarkPage;
