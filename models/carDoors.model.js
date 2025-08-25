const mongoose = require("mongoose");

const carDoorsSchema = new mongoose.Schema(
  {
    doors: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

carDoorsSchema.index(
  { doors: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

module.exports = mongoose.model("CarDoor", carDoorsSchema);
