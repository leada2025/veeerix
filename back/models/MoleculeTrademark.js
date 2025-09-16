const mongoose = require("mongoose");

const MoleculeTrademarkSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    moleculeName: {
      type: String,
      required: true,
      trim: true,
    },
    trademarkName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Ensure uniqueness per customer (trademark cannot be duplicated for same customer)
MoleculeTrademarkSchema.index(
  { customerId: 1, trademarkName: 1 },
  { unique: true }
);

module.exports = mongoose.model("MoleculeTrademark", MoleculeTrademarkSchema);
