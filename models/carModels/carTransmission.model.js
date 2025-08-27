const mongoose = require("mongoose");

const carTransmissionSchema = new mongoose.Schema(
  {
    transmission: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

carTransmissionSchema.index(
  { transmission: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

module.exports = mongoose.model("Transmission", carTransmissionSchema);
