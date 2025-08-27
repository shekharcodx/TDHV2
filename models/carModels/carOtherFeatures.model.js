const mongoose = require("mongoose");

const otherFeaturesSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OtherFeature", otherFeaturesSchema);
