const mongoose = require("mongoose");

const seatingCapacitySchema = new mongoose.Schema(
  {
    seats: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SeatingCapacity", seatingCapacitySchema);
