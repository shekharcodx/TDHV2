const mongoose = require("mongoose");

const yearsSchema = new mongoose.Schema(
  {
    year: { type: String, required: true },
    isActive: { type: String, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Years", yearsSchema);
