const mongoose = require("mongoose");

const BrandRequestSchema = new mongoose.Schema({
  moleculeName: { type: String, default: "" },
  customMolecule: { type: String, default: "" },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Requested Payment", "Paid"],
    default: "Pending",
  },
   approvedAt: { type: Date, default: null },
  requestedPaymentAt: { type: Date, default: null },
  paidAt: { type: Date, default: null },
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
 seenByCustomer: { type: Date, default: null },
 lastAdminActivityAt: { type: Date, default: null },

  quotedAmount: { type: Number, default: 0 },    // ✅ Admin's final quoted amount

  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

BrandRequestSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  if (!update) return next();

  if (update.status === "Approved") {
    update.approvedAt = new Date();
  }
  if (update.status === "Requested Payment") {
    update.requestedPaymentAt = new Date();
  }
  if (update.status === "Paid") {
    update.paidAt = new Date();
    update.paymentDone = true;
  }

  next();
});



module.exports = mongoose.model("BrandRequest", BrandRequestSchema);
