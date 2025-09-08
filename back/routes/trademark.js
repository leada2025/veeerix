const express = require("express");
const router = express.Router();
const Trademark = require("../models/TrademarkSuggestion");
const mongoose = require("mongoose");
const upload = require("../middleware/multer");
const multer = require("multer");

router.post("/", async (req, res) => {
  try {
    const { customerId, suggestions, selectedBrandName } = req.body;

    if (!customerId || !selectedBrandName) {
      return res.status(400).json({ error: "Missing customerId or selectedBrandName" });
    }

    const suggestionDoc = new Trademark({
      customerId,
      selectedBrandName,
      suggestions: suggestions.map((name) => ({ name })),
    });

    await suggestionDoc.save();
    res.status(201).json(suggestionDoc);
  } catch (err) {
    console.error("Error creating trademark suggestion:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// NEW: Customer adds a direct finalized trademark
// NEW: Customer adds a direct finalized trademark
router.post("/direct", async (req, res) => {
  const { customerId, name, brandName } = req.body;

  if (!customerId || !name) {
    return res.status(400).json({ error: "Missing customerId or name." });
  }

  try {
    const directTrademark = new Trademark({
      customerId,
      suggestions: [{ name, status: "Available" }],
      selectedName: name,
      selectedBrandName: brandName || null,   // ✅ save molecule/brand name
      trackingStatus: "Registered",   // ✅ Final stage directly
      isDirect: true,                 
      paymentCompleted: true          
    });

    await directTrademark.save();
    res.status(201).json(directTrademark);
  } catch (err) {
    console.error("Error adding direct trademark:", err);
    res.status(500).json({ error: "Server error." });
  }
});

// Edit direct trademark
router.put("/direct/:id", async (req, res) => {
  const { id } = req.params;
  const { name, brandName } = req.body;

  try {
    const updateFields = {};
    if (name) {
      updateFields.selectedName = name;
      updateFields["suggestions.0.name"] = name;
    }
    if (brandName) {
      updateFields.selectedBrandName = brandName;
    }

    const updated = await Trademark.findByIdAndUpdate(id, updateFields, { new: true });

    if (!updated) return res.status(404).json({ error: "Trademark not found" });
    res.json(updated);
  } catch (err) {
    console.error("Edit direct trademark error:", err);
    res.status(500).json({ error: "Failed to edit trademark" });
  }
});

// Delete direct trademark
router.delete("/direct/:id", async (req, res) => {
  try {
    const deleted = await Trademark.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Trademark not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("Delete direct trademark error:", err);
    res.status(500).json({ error: "Failed to delete trademark" });
  }
});


router.post("/:id/payment", async (req, res) => {
  try {
    const updated = await Trademark.findByIdAndUpdate(
      req.params.id,
      { paymentCompleted: true },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error("Payment update failed", err);
    res.status(500).json({ error: "Failed to mark payment" });
  }
});

router.post("/:id/upload-admin-doc", async (req, res) => {
  upload.single("adminDoc")(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.code || "Upload error" });
    } else if (err) {
      return res.status(500).json({ error: "Unexpected error during upload" });
    } else if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    try {
      const url = `/uploads/${req.file.filename}`;
      const updated = await Trademark.findByIdAndUpdate(
        req.params.id,
        { adminDocumentUrl: url },
        { new: true }
      );
      res.json(updated);
    } catch (dbErr) {
      console.error("DB update failed", dbErr);
      res.status(500).json({ error: "Failed to save document URL" });
    }
  });
});

router.post("/:id/upload-signed-doc", upload.single("signedDoc"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const url = `/uploads/${req.file.filename}`;
    const updated = await Trademark.findByIdAndUpdate(
      req.params.id,
      { customerSignedDocUrl: url },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error("Signed doc upload error", err);
    res.status(500).json({ error: "Failed to upload signed document" });
  }
});

// routes/trademark.js
router.get("/stats", async (req, res) => {
  try {
    const total = await Trademark.countDocuments();
    const approved = await Trademark.countDocuments({ trackingStatus: "Approved by Admin" });
    const pending = await Trademark.countDocuments({ trackingStatus: "Pending Review" });
    const documents = await Trademark.countDocuments({ adminDocumentUrl: { $ne: "" } });
    const payments = await Trademark.countDocuments({ paymentCompleted: true });

    // --- Trends Calculation (last 30 days vs previous 30 days) ---
    const now = new Date();
    const lastMonth = new Date(now);
    lastMonth.setMonth(now.getMonth() - 1);
    const prevMonth = new Date(now);
    prevMonth.setMonth(now.getMonth() - 2);

    const getCount = (filter) => Trademark.countDocuments(filter);

    // Total
    const lastMonthTotal = await getCount({ createdAt: { $gte: lastMonth } });
    const prevMonthTotal = await getCount({ createdAt: { $gte: prevMonth, $lt: lastMonth } });

    // Approved
    const lastMonthApproved = await getCount({
      trackingStatus: "Approved by Admin",
      createdAt: { $gte: lastMonth },
    });
    const prevMonthApproved = await getCount({
      trackingStatus: "Approved by Admin",
      createdAt: { $gte: prevMonth, $lt: lastMonth },
    });

    // Pending
    const lastMonthPending = await getCount({
      trackingStatus: "Pending Review",
      createdAt: { $gte: lastMonth },
    });
    const prevMonthPending = await getCount({
      trackingStatus: "Pending Review",
      createdAt: { $gte: prevMonth, $lt: lastMonth },
    });

    // Documents
    const lastMonthDocs = await getCount({
      adminDocumentUrl: { $ne: "" },
      createdAt: { $gte: lastMonth },
    });
    const prevMonthDocs = await getCount({
      adminDocumentUrl: { $ne: "" },
      createdAt: { $gte: prevMonth, $lt: lastMonth },
    });

    // Payments
    const lastMonthPayments = await getCount({
      paymentCompleted: true,
      createdAt: { $gte: lastMonth },
    });
    const prevMonthPayments = await getCount({
      paymentCompleted: true,
      createdAt: { $gte: prevMonth, $lt: lastMonth },
    });

    const calcTrend = (current, previous) =>
      previous === 0 ? (current > 0 ? 100 : 0) : (((current - previous) / previous) * 100).toFixed(1);

    const trends = {
      total: calcTrend(lastMonthTotal, prevMonthTotal),
      approved: calcTrend(lastMonthApproved, prevMonthApproved),
      pending: calcTrend(lastMonthPending, prevMonthPending),
      documents: calcTrend(lastMonthDocs, prevMonthDocs),
      payments: calcTrend(lastMonthPayments, prevMonthPayments),
    };

    // Recent 5
    const recent = await Trademark.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("customerId", "name email");

    res.json({ total, approved, pending, documents, payments, trends, recent });
  } catch (err) {
    console.error("Stats fetch error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// routes/trademark.js
// Define proper stage order
const stageOrder = [
  "Finalized by Customer",
  "Payment Done",
  "Docs Uploaded",
  "Registered",
];

router.get("/customer-dashboard", async (req, res) => {
  try {
    const customerId = req.query.customerId;
    if (!customerId) {
      return res.status(400).json({ error: "customerId missing" });
    }

    // Stats
    const active = await Trademark.countDocuments({
      customerId,
      trackingStatus: { $ne: "Registered" },
    });

    const completed = await Trademark.countDocuments({
      customerId,
      trackingStatus: "Registered",
    });

    const pendingPayments = await Trademark.countDocuments({
      customerId,
      selectedName: { $exists: true, $ne: "" },
      paymentCompleted: false,
    });

    const docsUploaded = await Trademark.countDocuments({
      customerId,
      $or: [
        { adminDocumentUrl: { $exists: true, $ne: "" } },
        { customerSignedDocUrl: { $exists: true, $ne: "" } },
      ],
    });

    // Helper to normalize stage
    const normalizeRequest = (req) => {
  let normalizedStatus = req.trackingStatus;

  if (req.trackingStatus === "Finalized by Customer" && req.paymentCompleted) {
    normalizedStatus = "Payment Done";
  }

  if (
    (req.adminDocumentUrl || req.customerSignedDocUrl) &&
    req.trackingStatus !== "Registered"
  ) {
    normalizedStatus = "Docs Uploaded";
  }

  return {
    _id: req._id,
    customerId: req.customerId,
    selectedName:
      req.selectedName ||
      (Array.isArray(req.suggestions) && req.suggestions.length > 0
        ? req.suggestions[0].name
        : "Unnamed"),
    trackingStatus: normalizedStatus,
    updatedAt: req.updatedAt,
  };
};


    // Active Requests (normalize)
    const activeRequestsRaw = await Trademark.find({
      customerId,
      trackingStatus: { $ne: "Registered" },
      selectedName: { $exists: true, $ne: "" },
    })
      .sort({ updatedAt: -1 })
      .limit(4);

    const activeRequests = activeRequestsRaw.map(normalizeRequest);

    // Recent Updates (normalize)
    const recentUpdatesRaw = await Trademark.find({ customerId })
      .sort({ updatedAt: -1 })
      .limit(5);

    const recentUpdates = recentUpdatesRaw.map(normalizeRequest);

    // Response
    res.json({
      stats: { active, completed, pendingPayments, docsUploaded },
      activeRequests,
      recentUpdates,
      stageOrder,
    });
  } catch (err) {
    console.error("Customer dashboard error:", err);
    res.status(500).json({ error: "Failed to load customer dashboard" });
  }
});


// 2. Admin fetches all suggestions
router.get("/", async (req, res) => {
  const all = await Trademark.find().populate("customerId", "name email");
  res.json(all);
});

// ✅ Finalized — must be ABOVE `/:customerId`
router.get("/finalized/:customerId", async (req, res) => {
  const { customerId } = req.params;
  const doc = await Trademark.find({ customerId, selectedName: { $ne: null } });
  res.json(doc);
});

// ✅ Finalized — must be ABOVE `/:customerId`
router.get("/finalized", async (req, res) => {
  const finalized = await Trademark.find({ selectedName: { $ne: null } }).populate("customerId", "name email");
  res.json(finalized);
});

// ✅ General fetch by customerId — comes AFTER all fixed string routes
// GET by customerId
// Change this from findOne to find
// Exclude direct trademarks
router.get("/:customerId", async (req, res) => {
  const { customerId } = req.params;
  const submissions = await Trademark.find({
    customerId,
    isDirect: { $ne: true }  // exclude direct ones
  }).sort({ createdAt: -1 });
  res.json(submissions);
});



// 3. Admin marks availability & sends selected names to customer
router.post('/:id/approve', async (req, res) => {
  const { id } = req.params;
  const { approvedNames, remark } = req.body;

  try {
    const updated = await Trademark.findByIdAndUpdate(
      id,
      {
        approvedNames,
        suggestedToCustomer: approvedNames,
        trackingStatus: "Approved by Admin",
        remark: remark || "",
      },
      { new: true }
    );

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to approve suggestions" });
  }
});

// 4. Customer finalizes one name
router.post("/:id/finalize", async (req, res) => {
  const { selectedName } = req.body;

  const suggestion = await Trademark.findById(req.params.id);
  if (!suggestion) return res.status(404).json({ error: "Not found" });

  if (!suggestion.suggestedToCustomer.includes(selectedName)) {
    return res.status(400).json({ error: "Name not in approved list" });
  }

  suggestion.selectedName = selectedName;
  suggestion.trackingStatus = "Finalized by Customer";
  await suggestion.save();

  res.json(suggestion);
});

router.put("/select/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { selectedName } = req.body;

    const updated = await Trademark.findByIdAndUpdate(
      id,
      {
        selectedName,
        trackingStatus: "Final Name Selected by Customer",
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Trademark not found." });
    }

    res.json(updated);
  } catch (err) {
    console.error("Error selecting final name:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// 5. Admin updates status manually (optional)
router.put("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updated = await Trademark.findByIdAndUpdate(id, {
      trackingStatus: status,
    }, { new: true });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

module.exports = router;
