const mongoose = require("mongoose");

const yearsSchema = new mongoose.Schema(
  {
    year: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

yearsSchema.index(
  { year: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

module.exports = mongoose.model("Years", yearsSchema);
