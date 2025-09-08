const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");
const Order = require("../models/Order"); // ✅ Correct model import

// --- Customers CRUD ---
// --- Customers CRUD ---
// routes/distribution.js
router.get("/customers/:distributorId", async (req, res) => {
  try {
    const { distributorId } = req.params;
    const customers = await Customer.find({ distributorId });
    res.json(customers);
  } catch (err) {
    console.error("Error fetching distributor customers:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// --- Orders related to Distribution (filter by distributor) ---
router.get("/orders/:customerId", async (req, res) => {
  const { customerId } = req.params;
  const orders = await Order.find({ customerId }) 
    .populate("customerId", "name email") // distributor
    .populate("subCustomerId", "name");   // retailer
  res.json(orders);
});

// Get orders for all customers of a distributor
router.get("/orders/distributor/:distributorId", async (req, res) => {
  const { distributorId } = req.params;

  try {
    // Step 1: Get all customers of this distributor
    const customers = await Customer.find({ distributorId }); // make sure Customer model has distributorId field
    const customerIds = customers.map(c => c._id);

    // Step 2: Get orders for these customers (retailers)
    const orders = await Order.find({ subCustomerId: { $in: customerIds } })
      .populate("customerId", "name email")      // distributor info
      .populate("subCustomerId", "name email"); // retailer info

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch customers' orders" });
  }
});



router.post("/customers", async (req, res) => {
  const customer = new Customer(req.body);
  await customer.save();
  res.json(customer);
});

router.put("/customers/:id", async (req, res) => {
  const updated = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.delete("/customers/:id", async (req, res) => {
  await Customer.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// --- Create Order ---
router.post("/orders", async (req, res) => {
  const order = new Order(req.body);
  await order.save();
  const populated = await Order.findById(order._id)
    .populate("customerId", "name email")
    .populate("subCustomerId", "name");
  res.json(populated);
});



module.exports = router;
