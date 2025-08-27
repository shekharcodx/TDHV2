const mongoose = require("mongoose");

const carBrandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    logo: {
      url: { type: String, required: true },
      key: { type: String, required: true },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CarBrand", carBrandSchema);
