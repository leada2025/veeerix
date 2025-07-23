require("dotenv").config(); // Load .env first

const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const brandRoutes = require("./routes/brandRoutes");
const tradeRoutes =require("./routes/trademark")
const packingRoutes = require("./routes/packingRoutes");
const moleculeRoutes = require("./routes/molecule");
const cors = require("cors");
const orderRoutes = require("./routes/orderRoutes");

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/users", userRoutes);
app.use("/api", brandRoutes);
app.use("/api/trademark",tradeRoutes )
app.use("/packing", packingRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/molecules", moleculeRoutes);
app.use("/orders", orderRoutes);


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
