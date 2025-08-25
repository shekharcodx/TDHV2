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

TrimSchema.index(
  { name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

module.exports = mongoose.model("Trim", TrimSchema);
