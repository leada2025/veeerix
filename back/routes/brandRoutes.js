const express = require("express");
const router = express.Router();
const BrandRequest = require("../models/BrandRequest");
const mongoose = require("mongoose");
// Create a new quote request
router.post("/brand-request", async (req, res) => {
  try {
    const { moleculeName, customMolecule, customerId } = req.body;

    const newRequest = new BrandRequest({
      moleculeName,
      customMolecule,
      customerId,
    });

    const saved = await newRequest.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error saving brand request:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get all brand requests for admin (populate customer info)
router.get("/admin/brand-requests", async (req, res) => {
  try {
    const allRequests = await BrandRequest.find()
      .populate("customerId", "name email"); // adjust fields as needed
    res.json(allRequests);
  } catch (err) {
    console.error("Admin fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// Get all requests for a customer
router.get("/brand-request/:customerId", async (req, res) => {
  const { customerId } = req.params;

  // Validate ID format
  if (!customerId || customerId === "undefined" || !mongoose.Types.ObjectId.isValid(customerId)) {
    return res.status(400).json({ error: "Invalid or missing customerId" });
  }

  try {
    const requests = await BrandRequest.find({ customerId });
    res.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ error: "Server error" });
  }
});


// Update request status or payment
router.patch("/brand-request/:id", async (req, res) => {
  try {
    const updated = await BrandRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    console.error("Error updating brand request:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.delete("/brand-request/:id", async (req, res) => {
  try {
    await BrandRequest.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete" });
  }
});


module.exports = router;
