const mongoose = require("mongoose");

const countrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String }, // optional: ISO code like "US", "PK"
  },
  { timestamps: true }
);

countrySchema.index(
  { name: 1 },
  { collation: { locale: "en", strength: 2 }, unique: true }
);
module.exports = mongoose.model("Country", countrySchema);
