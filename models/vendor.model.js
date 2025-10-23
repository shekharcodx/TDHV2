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
      default: "",
    },
    address: {
      street: { type: String, default: "" },
      country: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      mapUrl: { type: String, default: "" },
    },
    contact: {
      whatsappNum: { type: String, default: "" },
      landlineNum: { type: String, default: "" },
      mobileNum: { type: String, default: "" },
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
    stripeAccountId: { type: String, default: null },
    stripeOnboardingCompleted: { type: Boolean, default: false },
    stripeDetailsSubmitted: { type: Boolean, default: false },
    payoutsEnabled: { type: Boolean, default: false },
    chargesEnabled: { type: Boolean, default: false },
    stripeDashboardLink: { type: String, default: null },
  },
  { timestamps: true }
);

vendorDetailsSchema.index({ "address.city": 1 });
vendorDetailsSchema.index({ businessName: 1 });

module.exports = mongoose.model("VendorDetail", vendorDetailsSchema);
