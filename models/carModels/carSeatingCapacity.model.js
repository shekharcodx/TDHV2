const mongoose = require("mongoose");

const seatingCapacitySchema = new mongoose.Schema(
  {
    seats: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

seatingCapacitySchema.index(
  { seats: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

module.exports = mongoose.model("SeatingCapacity", seatingCapacitySchema);
