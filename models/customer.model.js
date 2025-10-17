const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contact: {
      phoneNum: { type: String, required: true },
      address: { type: String, default: "" },
      emirate: { type: String, default: "" },
    },
    origin: { type: String, default: "" },
    documents: {
      emiratesIdFront: { key: String, filename: String },
      emiratesIdBack: { key: String, filename: String },
      drivingLicenseFront: { key: String, filename: String },
      drivingLicenseBack: { key: String, filename: String },
      passport: { key: String, filename: String },
      visa: { key: String, filename: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CustomerDetail", customerSchema);
