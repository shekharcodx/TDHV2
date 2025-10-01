const mongoose = require("mongoose");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const bodyTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

bodyTypeSchema.index(
  { name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

bodyTypeSchema.plugin(aggregatePaginate);

module.exports = mongoose.model("BodyType", bodyTypeSchema);
