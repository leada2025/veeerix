// models/PackingDesign.js
const mongoose = require("mongoose");

const packingDesignSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // ✅ New Fields for Trademark & Molecule
    trademarkName: { type: String, required: true },
    moleculeName: { type: String, required: true },

    selectedDesignIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "AvailablePackingDesign" }],
    selectedFinalDesign: {
      type: String, // File path or URL
    },

    submitted: { type: Boolean, default: false },
    finalDesignUrl: String, // admin-uploaded finalized version
    status: {
      type: String,
      enum: ["Pending", "Sent for Customer Approval", "Approved", "Rejected", "Final Artwork Pending"],
      default: "Pending",
    },
    adminEditedDesigns: [
      {
        url: String,
        notes: String, // optional comment from admin
      },
    ],
    approvedDesignUrl: String,
    finalArtworkUrl: String,
    finalArtworkType: { type: String, enum: ["image", "pdf"] },
finalProductImages: [
      {
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    rejectionReason: String,
    trackingStep: { type: Number, default: 0 },
    postPrintStep: { type: Number, default: null },
    history: [
      {
        step: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    lastAdminUpdate: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PackingDesign", packingDesignSchema);
