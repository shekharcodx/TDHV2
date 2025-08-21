const mongoose = require("mongoose");

const carTransmissionSchema = new mongoose.Schema(
  {
    transmission: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transmission", carTransmissionSchema);
