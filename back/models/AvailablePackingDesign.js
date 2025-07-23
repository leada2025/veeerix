// models/AvailablePackingDesign.js
const mongoose = require("mongoose");

const availablePackingDesignSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    imageUrl: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional
  },
  { timestamps: true }
);

module.exports = mongoose.model("AvailablePackingDesign", availablePackingDesignSchema);
