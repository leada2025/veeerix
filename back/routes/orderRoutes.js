const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const User = require("../models/User");
const TrademarkSuggestion = require("../models/TrademarkSuggestion");
const BrandRequest = require("../models/BrandRequest");


// ✅ Global trademark fetch
// backend: routes/orders.js
router.get("/trademarks/:customerId", async (req, res) => {
  const { customerId } = req.params;
  try {
    const trademarks = await TrademarkSuggestion.find({
      customerId,
      paymentCompleted: true,
    }).select("selectedName selectedBrandName");

    res.json(trademarks);
  } catch (err) {
    console.error("Error fetching trademarks:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// POST /api/orders/from-trademark
// POST /api/orders/from-trademark
router.post("/from-trademark", async (req, res) => {
  try {
    const { customerId, subCustomerId, brandName, moleculeName, customMolecule, quantity } = req.body;

    if (!customerId || !brandName || !quantity)
      return res.status(400).json({ error: "Missing required fields" });

    if (!moleculeName && !customMolecule)
      return res.status(400).json({ error: "Either moleculeName or customMolecule is required" });

    const newOrder = await Order.create({
      customerId,
      subCustomerId: subCustomerId || null, // optional
      brandName,
      moleculeName: moleculeName || "",
      customMolecule: customMolecule || "",
      quantity,
    });

    res.status(201).json(newOrder);
  } catch (err) {
    console.error("Order creation failed:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});


// GET latest order by customerId (customer portal)
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;

    const allOrders = await Order.find({
      $or: [
        { customerId },          // distributor's own orders
        { subCustomerId: customerId }, // orders for their sub-customer
      ],
    })
      .sort({ createdAt: -1 })
      .populate('customerId', 'name email')
      .populate('subCustomerId', 'name email');

    res.json(allOrders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});



// GET orders for a specific customer (customer portal)
// GET /orders/options/:customerId
// GET /orders/options/:customerId
// GET /orders/options/:customerId
router.get("/options/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;

    const STAGES = [
      "New TM Application",
      "Send to Vienna Codification",
      "Formalities Check Pass",
      "Marked for Exam",
      "Examination Report Issued",
      "Accepted and Advertised",
      "Registered",
    ];

    const minStageIndex = STAGES.indexOf("New TM Application");

    const allBrands = await TrademarkSuggestion.find({ customerId });
    const usableBrands = allBrands.filter((b) => {
      const currentIndex = STAGES.indexOf(b.trackingStatus);
      return currentIndex >= minStageIndex;
    });

    const paidMolecules = await BrandRequest.find({
      customerId,
      status: "Paid",
    }).sort({ updatedAt: -1 });

    if (!usableBrands.length && !paidMolecules.length) {
      return res.status(404).json({ error: "No valid brands or paid molecules found" });
    }

    const brandNames = usableBrands.map((b) => b.selectedName);

    // ✅ pick moleculeName OR customMolecule
    const moleculeNames = paidMolecules.map(
      (m) => m.moleculeName || m.customMolecule
    );

    res.json({ brandNames, moleculeNames });
  } catch (error) {
    console.error("Error fetching brand/molecule options:", error);
    res.status(500).json({ error: "Internal Server Error" });
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


// GET all orders (for admin)
router.get('/admin/all', async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('customerId', 'name'); // <-- Populate only the name field
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});


// PATCH: update tracking step
router.patch('/admin/:orderId/step', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { trackingStep } = req.body;

    const updated = await Order.findByIdAndUpdate(
      orderId,
      { trackingStep },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Order not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update tracking step' });
  }
});


module.exports = router;
