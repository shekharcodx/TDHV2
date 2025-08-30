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

carBrandSchema.index(
  { name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

module.exports = mongoose.model("CarBrand", carBrandSchema);
