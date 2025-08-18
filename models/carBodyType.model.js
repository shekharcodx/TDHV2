const mongoose = require("mongoose");

const bodyTypeSchema = new mongoose.Schema(
  { name: { type: String, required: true } },
  { timestamps: true }
);

module.exports = mongoose.model("BodyType", bodyTypeSchema);
