const mongoose = require("mongoose");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

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

carTransmissionSchema.plugin(aggregatePaginate);

module.exports = mongoose.model("Transmission", carTransmissionSchema);
