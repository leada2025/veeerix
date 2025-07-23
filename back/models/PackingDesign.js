// models/PackingDesign.js
const mongoose = require("mongoose");

const packingDesignSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    selectedDesignId: { type: mongoose.Schema.Types.ObjectId, ref: "AvailablePackingDesign" }, // refers to uploaded design
    submitted: { type: Boolean, default: false },
    finalDesignUrl: String, // admin-uploaded finalized version
    status: {
      type: String,
      enum: ["Pending", "Sent for Customer Approval", "Approved", "Rejected"],
      default: "Pending",
    },
    rejectionReason: String,
    trackingStep: { type: Number, default: 0 },
    history: [
      {
        step: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("PackingDesign", packingDesignSchema);
