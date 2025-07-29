const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const User = require("../models/User");
const TrademarkSuggestion = require("../models/TrademarkSuggestion");
const BrandRequest = require("../models/BrandRequest");



// POST /api/orders/from-trademark
router.post("/from-trademark", async (req, res) => {
  try {
    const { customerId, brandName, moleculeName, quantity } = req.body;

    if (!customerId || !brandName || !moleculeName || !quantity) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newOrder = await Order.create({
      customerId,
      brandName,
      moleculeName,
      quantity,
    });

    res.status(201).json(newOrder);
  } catch (err) {
    console.error("Order creation failed:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// GET all orders (admin view)
// GET latest order by customerId
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const allOrders = await Order.find({ customerId }).sort({ createdAt: -1 });
    res.json(allOrders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});



// GET orders for a specific customer (customer portal)
// GET /orders/options/:customerId
router.get("/options/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;

    // Find latest registered brand
    const registeredBrands = await TrademarkSuggestion.find({
  customerId,
  trackingStatus: "Registered",
}).sort({ updatedAt: -1 });

const paidMolecules = await BrandRequest.find({
  customerId,
  status: "Paid", // or "Approved" if you're allowing un-paid access
}).sort({ updatedAt: -1 });

if (!registeredBrands.length || !paidMolecules.length) {
  return res.status(404).json({ error: "No registered brands or paid molecules found" });
}

// Extract only the needed fields
const brandNames = registeredBrands.map(b => b.selectedName);
const moleculeNames = paidMolecules.map(m => m.moleculeName);

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
