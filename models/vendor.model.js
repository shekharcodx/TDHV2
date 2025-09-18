const mongoose = require("mongoose");

const vendorDetailsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    address: {
      street: { type: String, required: true },
      country: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      mapUrl: { type: String, required: true },
    },
    contact: {
      whatsappNum: { type: String, required: true },
      landlineNum: { type: String, required: true },
      mobileNum: { type: String, required: true },
    },
    vendorInformation: {
      fleetSize: { type: Number },
      documents: {
        ijariCertificate: { key: String, filename: String },
        tradeLicense: { key: String, filename: String },
        vatCertificate: { key: String, filename: String },
        noc: { key: String, filename: String },
        emiratesId: { key: String, filename: String },
        poa: { key: String, filename: String },
      },
    },
  },
  { timestamps: true }
);

vendorDetailsSchema.index({ "address.city": 1 });
vendorDetailsSchema.index({ businessName: 1 });

module.exports = mongoose.model("VendorDetail", vendorDetailsSchema);
