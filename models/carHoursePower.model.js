const mongoose = require("mongoose");

const horsePowerSchema = new mongoose.Schema(
  {
    power: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HorsePower", horsePowerSchema);
