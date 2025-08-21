const mongoose = require("mongoose");

const carDoorsSchema = new mongoose.Schema(
  {
    doors: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CarDoor", carDoorsSchema);
