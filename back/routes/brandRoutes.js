const express = require("express");
const router = express.Router();
const BrandRequest = require("../models/BrandRequest");
const mongoose = require("mongoose");
const Molecule = require("../models/Molecule");
// Create a new quote request
router.post("/brand-request", async (req, res) => {
  try {
    const { moleculeName, customMolecule, customerId , customerComment} = req.body;

   const newRequest = new BrandRequest({
  moleculeName,
  customMolecule,
  customerId,
  customerComment,
    messages: []  // ✅ use directly from req.body
});


    const saved = await newRequest.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error saving brand request:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get all brand requests for admin (populate customer info)
// Get all brand requests for admin (populate customer info)
router.get("/admin/brand-requests", async (req, res) => {
  try {
    const allRequests = await BrandRequest.find()
      .populate("customerId", "name email");

    const requestsWithAmount = await Promise.all(
      allRequests.map(async (reqDoc) => {
        const mol = await Molecule.findOne({ name: reqDoc.moleculeName });

        return {
          ...reqDoc.toObject(),
          amount: mol?.amount ?? reqDoc.quotedAmount ?? 0,  // ✅ fallback
        };
      })
    );

    res.json(requestsWithAmount);
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
// PATCH: add message (customer or admin)
router.patch("/brand-request/:id/message", async (req, res) => {
  const { id } = req.params;
  const { sender, text } = req.body;

  if (!sender || !text) {
    return res.status(400).json({ message: "Sender and text are required" });
  }

  try {
    const update = {
      $push: { messages: { sender, text, timestamp: new Date() } },
    };

    // ✅ if sender is admin, update lastAdminActivityAt
    if (sender === "admin") {
      update.$set = { lastAdminActivityAt: new Date() };
    }

    const updated = await BrandRequest.findByIdAndUpdate(id, update, {
      new: true,
      select: "messages lastAdminActivityAt",
    });

    if (!updated) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// PATCH mark chat as seen by customer
router.patch("/brand-request/:id/seen", async (req, res) => {
  try {
    const updated = await BrandRequest.findByIdAndUpdate(
      req.params.id,
      { seenByCustomer: new Date() },
      { new: true, select: "seenByCustomer" }
    );

    if (!updated) return res.status(404).json({ message: "Request not found" });

    res.json(updated);
  } catch (err) {
    console.error("Seen update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// Update request status or payment
router.patch("/brand-request/:id", async (req, res) => {
  try {
    const updated = await BrandRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "BrandRequest not found with given ID" });
    }
    res.json(updated);
  } catch (error) {
    console.error("Error updating brand request:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


// PATCH only comment from customer
router.patch("/brand-request/:id/comment", async (req, res) => {
  try {
    const { customerComment } = req.body;
    const updated = await BrandRequest.findByIdAndUpdate(
      req.params.id,
      { customerComment },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// PATCH admin update amount + comment
router.patch("/brand-request/:id/admin", async (req, res) => {
  try {
    const { quotedAmount, status, adminComment } = req.body;
    const updated = await BrandRequest.findByIdAndUpdate(
      req.params.id,
      {
        quotedAmount,
        status,
        adminComment,
        lastAdminActivityAt: new Date(), // ✅ always refresh on admin action
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Admin update failed:", error);
    res.status(500).json({ message: "Server error" });
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
