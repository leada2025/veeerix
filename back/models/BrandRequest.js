const mongoose = require("mongoose");

const BrandRequestSchema = new mongoose.Schema({
  moleculeName: { type: String, default: "" },
  customMolecule: { type: String, default: "" },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Requested Payment", "Paid"],
    default: "Pending",
  },
  paymentDone: { type: Boolean, default: false },

  moleculeId: { type: mongoose.Schema.Types.ObjectId, ref: "Molecule" },

  customerComment: { type: String, default: "" }, // 💬 Comment from customer
  customAmount: { type: Number, default: 0 },     // 💰 Negotiated by customer

messages: {
  type: [
    {
      sender: { type: String, enum: ["customer", "admin"], required: true },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    }
  ],
  default: []
}
, 
  quotedAmount: { type: Number, default: 0 },    // ✅ Admin's final quoted amount

  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

;

module.exports = mongoose.model("BrandRequest", BrandRequestSchema);
