const express = require("express");
const router = express.Router();
const PackingDesign = require("../models/PackingDesign");
const fs = require("fs");
const path = require("path");
const upload = require("../middleware/multer");
const AvailablePackingDesign = require("../models/AvailablePackingDesign");

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

router.get("/tracking/:customerId", async (req, res) => {
  try {
   const entries = await PackingDesign.find({
  customerId: req.params.customerId,
  status: "Approved",
  trackingStep: { $gte: 0 },
});

    if (!entries.length) {
      return res.status(404).json({ message: "No approved designs with tracking found" });
    }

    res.json(entries);
  } catch (err) {
    console.error("Error fetching multiple tracking entries:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /packing/post-print-tracking
router.get("/post-print-tracking", async (req, res) => {
  try {
   const entries = await PackingDesign.find({
  status: "Approved",
  postPrintStep: { $gte: 0 },  // <-- use postPrintStep instead of trackingStep
})
.populate("customerId", "name")
.sort({ updatedAt: -1 });


    res.status(200).json(entries);
  } catch (err) {
    console.error("Error fetching post-print tracking entries:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/designs/upload", upload.single("designFile"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ message: "No file uploaded" });

  try {
    const newDesign = new AvailablePackingDesign({
      imageUrl: `/uploads/${file.filename}`, // ✅ Use file.filename (already saved by multer)
      label: req.body.label || "",
    });

    await newDesign.save();
    res.json({ message: "Design uploaded", data: newDesign });
  } catch (err) {
    console.error("Upload error:", err);
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
    $push: { history: { step: "Final design uploaded by admin" } },
  },
  { new: true, sort: { createdAt: -1 } } // ✅ update latest
);


    if (!design) return res.status(404).json({ message: "Design not found" });

    res.json({ message: "Final design uploaded", fileUrl: design.finalDesignUrl });
  } catch (err) {
    res.status(500).json({ message: "Upload error", error: err.message });
  }
});

router.post("/submit", async (req, res) => {
  const { customerId, selectedDesignIds } = req.body;

  try {
    const newEntry = new PackingDesign({
      customerId,
      selectedDesignIds,
      submitted: true,
    });

    await newEntry.save();
    res.json({ message: "Submitted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});




router.post("/send-edits/:designId", upload.array("files"), async (req, res) => {
  try {
    const designId = req.params.designId;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const savedFiles = req.files.map((file) => ({
      url: `/uploads/${file.filename}`,
      type: file.mimetype.includes("pdf") ? "pdf" : "image",
    }));

    const updated = await PackingDesign.findByIdAndUpdate(
      designId,
      {
        $set: {
          adminEditedDesigns: savedFiles,
          status: "Sent for Customer Approval",
        },
        $push: {
          history: { step: "Admin uploaded edited versions" },
        },
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error("Error uploading edited designs:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

router.post("/final-approve", async (req, res) => {
  const { designId } = req.body;

  try {
    const updated = await PackingDesign.findByIdAndUpdate(
      designId,
      {
        status: "Approved",
        trackingStep: 0,
        $push: { history: { step: "Customer approved final artwork" } },
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Final approval failed", error: err.message });
  }
});


router.post("/approve-edited", async (req, res) => {
  const { designId, selectedDesignId } = req.body;

  console.log("Incoming approval request:", req.body); // Add this!

  try {
    const updated = await PackingDesign.findByIdAndUpdate(
      designId,
      {
        selectedFinalDesign: selectedDesignId,
        status: "Final Artwork Pending",
        $push: {
          history: { step: "Customer approved an edited version" },
        },
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error("Approval failed:", err); // Print full error
    res.status(500).json({ message: "Approval failed", error: err.message });
  }
});


router.post("/final-artwork-upload/:designId", upload.single("file"), async (req, res) => {
  const { designId } = req.params;
  const file = req.file;

  if (!file) return res.status(400).json({ message: "No file uploaded" });

  try {
    const filePath = `uploads/${file.filename}`; // ✅ Now this will be defined
    const type = file.mimetype.includes("pdf") ? "pdf" : "image";

    const updated = await PackingDesign.findByIdAndUpdate(
      designId,
      {
        finalArtworkUrl: filePath,
        finalArtworkType: type,
        status: "Sent for Customer Approval",
        $push: { history: { step: "Admin uploaded final artwork" } },
      },
      { new: true }
    );

    res.json({ message: "Final artwork uploaded", design: updated });
  } catch (err) {
    res.status(500).json({ message: "Upload error", error: err.message });
  }
});


// GET /packing/submitted — Admin fetches all submitted designs
router.get("/submitted", async (req, res) => {
  try {
    const mode = req.query.mode || "pending"; // "pending" or "tracking"
    let query = {};

    if (mode === "pending") {
      query = {
        submitted: true,
        $or: [
          { finalDesignUrl: { $exists: false } },
          { status: "Rejected" } // Include rejected entries for pending mode
        ]
      };
    } else if (mode === "tracking") {
      query = {
        submitted: true,
        trackingStep: { $gte: 0 }, // ✅ Include all trackable steps
        status: { $ne: "Rejected" },
        $or: [
          { finalDesignUrl: { $exists: true } },
          { finalArtworkUrl: { $exists: true } } // ✅ Support finalArtworkUrl too
        ]
      };
    }

    const submissions = await PackingDesign.find(query)
      .populate("customerId", "name email")
      .populate("selectedDesignIds", "imageUrl")
      .populate("selectedFinalDesign", "imageUrl")
      .sort({ updatedAt: -1 }) // ✅ Sort by recent activity
      .lean();

    // Optional: fallback for designId -> design mapping (if selectedDesignId is used)
    const designIds = submissions.map((s) => s.selectedDesignId).filter(Boolean);
    const designs = await AvailablePackingDesign.find({ _id: { $in: designIds } }).lean();

    const designsMap = {};
    designs.forEach((d) => {
      designsMap[d._id.toString()] = d;
    });

    const enrichedSubmissions = submissions.map((s) => ({
      ...s,
      customerName: s.customerId?.name || s.customerId?.email || "Unknown",
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
    const design = await PackingDesign.findOne({
      customerId: req.params.customerId,
      status: "Approved",
    })
      .sort({ updatedAt: -1 }); // latest approved
    if (!design) return res.status(404).json({ message: "No approved packing design found" });
    res.json(design);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/history/:customerId", async (req, res) => {
  try {
    const history = await PackingDesign.find({ customerId: req.params.customerId })
      .populate("selectedDesignIds")
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history", error: err.message });
  }
});






// POST /packing/approve — Customer approves final
// POST /packing/approve — Customer approves final
router.post("/approve", async (req, res) => {
  const { designId } = req.body;
  try {
    const design = await PackingDesign.findOneAndUpdate(
      { _id: designId },
      {
        status: "Approved",
        trackingStep: 0,
        $push: { history: { step: "Customer Approved" } },
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
  const { designId, reason } = req.body;

  try {
    const design = await PackingDesign.findById(designId);
    if (!design) {
      return res.status(404).json({ message: "No design found to reject" });
    }

    if (!design.finalArtworkUrl) {
      return res.status(400).json({ message: "No final artwork exists to reject" });
    }

    design.status = "Final Artwork Pending"; // allow admin to re-upload
    design.rejectionReason = reason;
    design.finalArtworkUrl = undefined; // ✅ best way to clear field
    design.finalArtworkType = undefined;
    design.adminUploaded = false;
    design.trackingStep = 0;

    await design.save();

    res.json({ message: "Design rejected and reset", design });
  } catch (err) {
    console.error("Reject error:", err.message, err.stack);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});



// Cancel pending submission
router.post("/cancel", async (req, res) => {
  const { designId } = req.body;
  try {
    const entry = await PackingDesign.findById(designId);
    if (!entry) return res.status(404).json({ message: "Not found" });

    if (entry.status !== "Pending") {
      return res.status(400).json({ message: "Only pending submissions can be canceled" });
    }

    await PackingDesign.findByIdAndDelete(designId);
    res.status(200).json({ message: "Cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
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
  const { stepLabel, stepIndex, isPostPrint = false } = req.body;

  const update = {
    $push: {
      history: {
        step: stepLabel,
        date: new Date(),
      },
    },
  };

  if (isPostPrint) {
    update.postPrintStep = stepIndex;

    // Auto-resume main flow after post-print ends
    if (stepIndex === 4) {
      update.trackingStep = 3; // "In Progress"
    }
  } else {
    update.trackingStep = stepIndex;

    // Automatically reset postPrintStep if Sent for Printing
    if (stepIndex === 2) {
      update.postPrintStep = 0; // start post-print
    }
  }

  try {
    const design = await PackingDesign.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );
    res.json(design);
  } catch (err) {
    console.error("Error updating step:", err);
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
          history: { step: `Step changed to ${step}` },
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
router.patch("/:id/post-print-step", async (req, res) => {
  try {
    const { step } = req.body;

    const updated = await PackingDesign.findByIdAndUpdate(
      req.params.id,
      {
        postPrintStep: step,
        $push: {
          history: { step: `Post-Print Step changed to ${step}` },
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Packing design not found" });
    }

    // Auto-transition logic
    // if (step === 4) {
    //   updated.trackingStep = 3;
    //   updated.postPrintStep = null; // Optional cleanup
    //   await updated.save();
    // }

    res.status(200).json(updated);
  } catch (err) {
    console.error("Error updating post-print step:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /packing/designs/:id — Delete an available packing design
router.delete("/designs/:id", async (req, res) => {
  try {
    const design = await AvailablePackingDesign.findByIdAndDelete(req.params.id);

    if (!design) {
      return res.status(404).json({ message: "Design not found" });
    }

    // Also delete the image file from the server
    const filePath = path.join(__dirname, "..", design.imageUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: "Design deleted successfully" });
  } catch (err) {
    console.error("Error deleting design:", err);
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;
