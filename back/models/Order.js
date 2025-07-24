const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // The main customer/distributor placing the order
      required: true,
    },
    subCustomerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer", // The sub-customer/retailer
      required: false, // Optional in case order is directly placed by main customer
    },
    brandName: { type: String, required: true },
    moleculeName: { type: String, required: true },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    trackingStep: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
