const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: String,
  address: String,
  email: String,
  phone: String,
  drugLicense: String,
  gst: String,
  pan: String,
});

module.exports = mongoose.model("Customer", customerSchema);
