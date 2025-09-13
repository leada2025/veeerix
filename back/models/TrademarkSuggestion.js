const mongoose = require("mongoose");



const TrademarkSuggestionSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    suggestions: [
      {
        name: String,
        status: {
          type: String,
          enum: ["Pending", "Available", "Not Available"],
          default: "Pending",
        },
      },
    ],

    suggestedToCustomer: [{ type: String }],

    selectedName: { type: String, default: null },
    selectedBrandName: { type: String, default: null },

    // 👇 This will hold either helper workflow OR TRADEMARK_STAGES
    trackingStatus: { type: String, default: "Pending Review" },

    isDirect: { type: Boolean, default: false },
    paymentCompleted: { type: Boolean, default: false },

    adminDocumentUrl: { type: String, default: "" },
    customerSignedDocUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrademarkSuggestion", TrademarkSuggestionSchema);
