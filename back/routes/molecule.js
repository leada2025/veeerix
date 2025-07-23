// routes/molecule.js
const express = require("express");
const router = express.Router();
const Molecule = require("../models/Molecule");

// Get all molecules
router.get("/", async (req, res) => {
  try {
    const molecules = await Molecule.find().sort({ name: 1 });
    res.json(molecules);
  } catch (err) {
    console.error("Fetch molecule error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Add new molecule (admin use)
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    const newMol = new Molecule({ name });
    const saved = await newMol.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Add molecule error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH to update
router.patch("/:id", async (req, res) => {
  try {
    const updated = await Molecule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

// DELETE to remove
router.delete("/:id", async (req, res) => {
  try {
    await Molecule.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});


module.exports = router;
