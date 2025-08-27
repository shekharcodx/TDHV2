const mongoose = require("mongoose");

const technicalFeaturesSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TechnicalFeature", technicalFeaturesSchema);
