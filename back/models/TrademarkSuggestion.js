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

    trackingStatus: { type: String, default: "Pending Review" },
  },
  {
    timestamps: true, // ✅ Correct placement of timestamps
  }
);

module.exports = mongoose.model("TrademarkSuggestion", TrademarkSuggestionSchema);
