const express = require("express");
const router = express.Router();
const PackingDesign = require("../models/PackingDesign");
const fs = require("fs");
const path = require("path");
const upload = require("../middleware/multer");
const AvailablePackingDesign = require("../models/AvailablePackingDesign");

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

router.post("/designs/upload", upload.single("designFile"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ message: "No file uploaded" });

  try {
    const filename = `${Date.now()}_${file.originalname}`;
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, file.buffer);

    const newDesign = new AvailablePackingDesign({
      imageUrl: `/uploads/${filename}`,
      label: req.body.label || "", // Optional
    });

    await newDesign.save();
    res.json({ message: "Design uploaded", data: newDesign });
  } catch (err) {
    res.status(500).json({ message: "Upload error", error: err.message });
  }
});

// GET /packing/designs — Fetch all available designs
router.get("/designs", async (req, res) => {
  try {
    const designs = await AvailablePackingDesign.find();
    res.json(designs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/upload-customer", upload.single("designFile"), async (req, res) => {
  const { customerId } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ message: "No file uploaded" });

  try {
    const filename = `${Date.now()}_${file.originalname}`;
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, file.buffer);

    const newEntry = new PackingDesign({
      customerId,
      selectedDesignFile: `/uploads/${filename}`,
      submitted: true,
    });

    await newEntry.save();
    res.json({ message: "Customer design uploaded", fileUrl: newEntry.selectedDesignFile });
  } catch (err) {
    res.status(500).json({ message: "Upload error", error: err.message });
  }
});

// POST /packing/upload-admin — Admin uploads final design file
router.post("/upload-admin", upload.single("finalDesign"), async (req, res) => {
  const { customerId } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ message: "No file uploaded" });

  try {
    const filename = `${Date.now()}_final_${file.originalname}`;
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, file.buffer);

    const design = await PackingDesign.findOneAndUpdate(
      { customerId },
      {
        finalDesignUrl: `/uploads/${filename}`,
        status: "Sent for Customer Approval",
        $push: {
          history: { step: "Final design uploaded by admin" },
        },
      },
      { new: true }
    );

    if (!design) return res.status(404).json({ message: "Design not found" });

    res.json({ message: "Final design uploaded", fileUrl: design.finalDesignUrl });
  } catch (err) {
    res.status(500).json({ message: "Upload error", error: err.message });
  }
});

router.post("/submit", async (req, res) => {
  const { customerId, selectedDesignId } = req.body;

  try {
    const latest = await PackingDesign.findOne({ customerId }).sort({ createdAt: -1 });

    // Block submission if there's already one in progress
    if (latest && latest.trackingStep < 4) {
      return res.status(400).json({ message: "Already submitted and in progress" });
    }

    const newEntry = new PackingDesign({
      customerId,
      selectedDesignId,
      submitted: true,
      trackingStep: 0, // New cycle starts from step 0
    });

    await newEntry.save();
    res.json({ message: "Submitted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// GET /packing/submitted — Admin fetches all submitted designs
router.get("/submitted", async (req, res) => {
  try {
    const mode = req.query.mode || "pending"; // either "pending" or "tracking"
    let query = {};

    if (mode === "pending") {
      query = {
        submitted: true,
        $or: [
          { finalDesignUrl: { $exists: false } },
          { status: "Rejected" } // ✅ Include rejected entries too
        ]
      };
    } else if (mode === "tracking") {
      query = {
        submitted: true,
        finalDesignUrl: { $exists: true },
        trackingStep: { $lt: 5 },
        status: { $ne: "Rejected" } // ✅ Optional: skip rejected from tracking
      };
    }

    const submissions = await PackingDesign.find(query)
      .populate("customerId", "name email")
      .lean();

    const designIds = submissions.map((s) => s.selectedDesignId);
    const designs = await AvailablePackingDesign.find({ _id: { $in: designIds } }).lean();

    const designsMap = {};
    designs.forEach((d) => {
      designsMap[d._id.toString()] = d;
    });

    const enrichedSubmissions = submissions.map((s) => ({
      ...s,
      customerName: s.customerId.name || s.customerId.email,
      selectedDesign: designsMap[s.selectedDesignId?.toString()],
    }));

    res.json(enrichedSubmissions);
  } catch (err) {
    console.error("Error fetching submitted designs:", err);
    res.status(500).json({ error: "Server error" });
  }
});



router.get("/:customerId", async (req, res) => {
  try {
    const allDesigns = await PackingDesign.find({ customerId: req.params.customerId })
      .sort({ createdAt: -1 });

    if (!allDesigns || allDesigns.length === 0) {
      return res.status(404).json({ message: "No designs found" });
    }

    const inProgress = allDesigns.find(d => d.trackingStep < 4);
    if (inProgress) {
      return res.json({ ...inProgress.toObject(), cycleStatus: "in-progress" });
    }

    // Completed design
    return res.json({ ...allDesigns[0].toObject(), cycleStatus: "completed" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});




// POST /packing/approve — Customer approves final
router.post("/approve", async (req, res) => {
  const { customerId } = req.body;
  try {
    const design = await PackingDesign.findOneAndUpdate(
      { customerId },
      {
        status: "Approved",
        $push: {
          history: { step: "Customer Approved" },
        },
      },
      { new: true }
    );
    res.json(design);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /packing/reject — Customer rejects final
router.post("/reject", async (req, res) => {
  const { customerId, reason } = req.body;
  try {
    const design = await PackingDesign.findOne({
      customerId,
      status: "Sent for Customer Approval", // Only reject from approval stage
    }).sort({ createdAt: -1 }); // Get latest cycle only

    if (!design) {
      return res.status(404).json({ message: "No design found to reject" });
    }

    design.status = "Rejected";
    design.rejectionReason = reason;
    design.finalDesignUrl = null; // Remove previous design
    design.adminUploaded = false; // So it appears in admin panel again
    design.trackingStep = 0; // Reset tracking if needed
    await design.save();

    res.json({ message: "Design rejected successfully", design });
  } catch (err) {
    console.error("Reject error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// PUT /packing/final-upload — Admin uploads final design
router.put("/final-upload", async (req, res) => {
  const { customerId, finalDesignUrl } = req.body;
  try {
    const design = await PackingDesign.findOneAndUpdate(
      { customerId },
      { finalDesignUrl, status: "Sent for Customer Approval" },
      { new: true }
    );
    res.json(design);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /packing/track/:id — Admin updates tracking step
router.put("/track/:id", async (req, res) => {
  const { stepLabel, stepIndex } = req.body;
  try {
    const design = await PackingDesign.findByIdAndUpdate(
      req.params.id,
      {
        trackingStep: stepIndex,
        $push: {
          history: {
            step: stepLabel,
          },
        },
      },
      { new: true }
    );
    res.json(design);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/history/:customerId", async (req, res) => {
  try {
    const entries = await PackingDesign.find({ customerId: req.params.customerId }).sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// PATCH /packing/:customerId/step
// routes/packing.js or similar
router.patch("/:id/step", async (req, res) => {
  try {
    const { step } = req.body;

    const updated = await PackingDesign.findByIdAndUpdate(
      req.params.id,
      {
        trackingStep: step,
        $push: {
          history: { step: `Step changed to ${step}` }, // optional
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Packing design not found" });
    }

    res.status(200).json(updated);
  } catch (err) {
    console.error("Error updating tracking step:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
