const mongoose = require("mongoose");

const horsePowerSchema = new mongoose.Schema(
  {
    power: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

horsePowerSchema.index(
  { power: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

module.exports = mongoose.model("HorsePower", horsePowerSchema);
