const mongoose = require("mongoose");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const carBrandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    logo: {
      url: { type: String, required: true },
      key: { type: String, required: true },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

carBrandSchema.index(
  { name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

carBrandSchema.plugin(aggregatePaginate);

module.exports = mongoose.model("CarBrand", carBrandSchema);
