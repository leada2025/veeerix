const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const User = require("../models/User");
const TrademarkSuggestion = require("../models/TrademarkSuggestion");
const BrandRequest = require("../models/BrandRequest");



// POST /api/orders/from-trademark
router.post("/from-trademark", async (req, res) => {
  try {
    const { customerId } = req.body;

    // 1. Get selected brand name from TrademarkSuggestion
    const trademark = await TrademarkSuggestion.findOne({
      customerId,
      selectedName: { $exists: true },
      trackingStatus: "Registered", // ensure it's finalized
    });

    if (!trademark) {
      return res.status(404).json({ error: "Trademark not registered yet" });
    }

    // 2. Get paid BrandRequest for molecule
    const brandRequest = await BrandRequest.findOne({
      customerId,
      status: "Paid",
    });

    if (!brandRequest) {
      return res.status(404).json({ error: "No paid brand request found" });
    }

    // 3. Create new Order
    const newOrder = await Order.create({
      customerId,
      brandName: trademark.selectedName,
      moleculeName: brandRequest.moleculeName,
    });

    res.status(201).json(newOrder);
  } catch (err) {
    console.error("Order creation failed:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// GET all orders (admin view)
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customerId", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET orders for a specific customer (customer portal)
router.get("/customer/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    const orders = await Order.find({ customerId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch customer orders" });
  }
});

// PUT - update tracking step (admin updates progress)
router.put("/:id/track", async (req, res) => {
  try {
    const { id } = req.params;
    const { trackingStep } = req.body;

    const updated = await Order.findByIdAndUpdate(
      id,
      { trackingStep },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update tracking step" });
  }
});

module.exports = router;
