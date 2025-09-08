const express = require("express");
const router = express.Router();
const User = require("../models/User");
const BrandRequest = require("../models/BrandRequest");
const Order = require("../models/Order");
const PackingDesign = require("../models/PackingDesign");
// Create new user (admin only)

router.get("/dashboard", async (req, res) => {
  try {
    // --- BrandRequest Stats ---
    const brandRequestCounts = await BrandRequest.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // --- Order Stats ---
    const totalOrders = await Order.countDocuments();
    const recentOrders = await Order.find()
      .populate("customerId", "name email")
      .populate("subCustomerId", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    // --- PackingDesign Stats ---
    const designCounts = await PackingDesign.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const recentDesigns = await PackingDesign.find()
      .populate("customerId", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    // --- Response ---
    res.json({
      success: true,
      brandRequests: {
        total: await BrandRequest.countDocuments(),
        counts: brandRequestCounts,
      },
      orders: {
        total: totalOrders,
        recent: recentOrders,
      },
      packingDesigns: {
        total: await PackingDesign.countDocuments(),
        counts: designCounts,
        recent: recentDesigns,
      },
    });
  } catch (err) {
    console.error("Admin Dashboard Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

router.post("/create", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const user = new User({ name, email, password, role: role || "customer" });
    await user.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Admin Login
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Not an admin" });
    }

    res.status(200).json({
      message: "Admin login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Fishman Admin Login
router.post("/fbsadmin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔹 Only allow users with role "fbsadmin"
    if (user.role !== "fbsadmin") {
      return res.status(403).json({ message: "Access denied: Not a Fishman admin" });
    }

    res.status(200).json({
      message: "Fishman admin login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ GET all customers (or users)
router.get("/", async (req, res) => {
  try {
    const users = await User.find(); // you can filter by role if needed: { role: 'customer' }
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Activate or deactivate a user
router.put("/:id/activate", async (req, res) => {
  try {
    const { active } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { active }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
