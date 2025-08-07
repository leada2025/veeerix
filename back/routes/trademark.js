const express = require("express");
const router = express.Router();
const Trademark = require("../models/TrademarkSuggestion");
const mongoose = require("mongoose");
const upload = require("../middleware/multer");
const multer = require("multer");

router.post("/", async (req, res) => {
  const { customerId, suggestions } = req.body;

  const suggestionDoc = new Trademark({
    customerId,
    suggestions: suggestions.map(name => ({ name }))
  });

  await suggestionDoc.save();
  res.status(201).json(suggestionDoc);
});
// NEW: Customer adds a direct finalized trademark
router.post("/direct", async (req, res) => {
  const { customerId, name } = req.body;

  if (!customerId || !name) {
    return res.status(400).json({ error: "Missing customerId or name." });
  }

  try {
  const directTrademark = new Trademark({
  customerId,
  suggestions: [{ name, status: "Available" }],
  selectedName: name,
  trackingStatus: "Registered", // ✅ Final stage directly
  isDirect: true,               // ✅ Skip admin review
});
await directTrademark.save();

    res.status(201).json(directTrademark);
  } catch (err) {
    console.error("Error adding direct trademark:", err);
    res.status(500).json({ error: "Server error." });
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
router.get("/:customerId", async (req, res) => {
  const { customerId } = req.params;
  try {
    const submissions = await Trademark.find({ customerId }).sort({ createdAt: -1 });
    res.json(submissions); // ⬅ return array of all submissions
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
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
