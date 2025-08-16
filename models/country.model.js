const mongoose = require("mongoose");

const countrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String }, // optional: ISO code like "US", "PK"
  },
  { timestamps: true }
);

module.exports = mongoose.model("Country", countrySchema);
