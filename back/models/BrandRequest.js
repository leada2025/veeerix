const mongoose = require("mongoose");

const BrandRequestSchema = new mongoose.Schema({
  moleculeName: {
    type: String,
    default: "",
  },
  customMolecule: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Requested Payment", "Paid"],
    default: "Pending",
  },
  paymentDone: {
    type: Boolean,
    default: false,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("BrandRequest", BrandRequestSchema);
