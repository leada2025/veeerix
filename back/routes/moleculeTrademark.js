const express = require("express");
const MoleculeTrademark = require("../models/MoleculeTrademark");

const router = express.Router();

/**
 * Add new molecule & trademark for a customer
 */
router.post("/add", async (req, res) => {
  try {
    const { customerId, moleculeName, trademarkName } = req.body;

    if (!customerId || !moleculeName || !trademarkName) {
      return res.status(400).json({
        message: "customerId, moleculeName, and trademarkName are required",
      });
    }

    // prevent duplicate (based on schema uniqueness)
    const existing = await MoleculeTrademark.findOne({ customerId, trademarkName });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Trademark already exists for this customer" });
    }

    const newRecord = new MoleculeTrademark({
      customerId,
      moleculeName,
      trademarkName,
    });
    await newRecord.save();

    res.json({
      message: "Molecule & Trademark added successfully",
      data: newRecord,
    });
  } catch (err) {
    console.error("Error adding Molecule & Trademark:", err);
    res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});

/**
 * Get all records for a specific customer
 */
router.get("/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    const records = await MoleculeTrademark.find({ customerId }).sort({
      createdAt: -1,
    });

    res.json({ data: records });
  } catch (err) {
    console.error("Error fetching Molecule & Trademark:", err);
    res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});

/**
 * Update a record by ID
 */
router.put("/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { moleculeName, trademarkName } = req.body;

    if (!moleculeName || !trademarkName) {
      return res.status(400).json({ message: "Both fields are required" });
    }

    // check duplicate trademark for same customer
    const existing = await MoleculeTrademark.findOne({
      _id: { $ne: id },
      customerId: req.body.customerId,
      trademarkName,
    });
    if (existing) {
      return res.status(400).json({ message: "Trademark already exists" });
    }

    const updated = await MoleculeTrademark.findByIdAndUpdate(
      id,
      { moleculeName, trademarkName },
      { new: true }
    );

    res.json({ message: "Record updated successfully", data: updated });
  } catch (err) {
    console.error("Edit error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * Delete a record by ID
 */
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await MoleculeTrademark.findByIdAndDelete(id);
    res.json({ message: "Record deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


module.exports = router;
