const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");
const Order = require("../models/Order"); // ✅ Correct model import

// --- Customers CRUD ---
router.get("/customers", async (req, res) => {
  const customers = await Customer.find();
  res.json(customers);
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

// --- Orders related to Distribution ---
router.get("/orders", async (req, res) => {
  const orders = await Order.find()
    .populate("customerId", "name email") // Main user (distributor)
    .populate("subCustomerId", "name");    // Sub-customer (retailer)
  res.json(orders);
});

router.post("/orders", async (req, res) => {
  const order = new Order(req.body);
  await order.save();
  res.json(order);
});

module.exports = router;
