const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  distributorId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" }, // distributor reference
  name: String,
  address: String,
  email: String,
  phone: String,
  drugLicense: String,
  gst: String,
  pan: String,
});

module.exports = mongoose.model("Customer", customerSchema);
