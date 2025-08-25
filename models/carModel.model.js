const mongoose = require("mongoose");

const carModelSchema = new mongoose.Schema(
  {
    name: { type: String, require: true },
    carBrand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarBrand",
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

carModelSchema.index(
  { name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

module.exports = mongoose.model("CarModel", carModelSchema);
