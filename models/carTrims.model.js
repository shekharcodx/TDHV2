const mongoose = require("mongoose");

const TrimSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    carModel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarModel",
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trim", TrimSchema);
