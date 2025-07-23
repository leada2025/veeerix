// models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  brandName: { type: String, required: true },
  moleculeName: { type: String, required: true },
  trackingStep: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
