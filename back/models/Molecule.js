// models/Molecule.js
const mongoose = require("mongoose");

const MoleculeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("Molecule", MoleculeSchema);
