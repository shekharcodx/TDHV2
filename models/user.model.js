const mongoose = require("mongoose");
const { USER_ROLES, ACCOUNT_STATUS } = require("../utils/constants");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    businessName: {
      type: String,
      required: function () {
        return this.role === USER_ROLES.VENDOR;
      },
    },
    password: { type: String, required: true },
    address: {
      street: String,
      country: String,
      city: String,
      state: String,
      mapUrl: String,
    },
    contact: {
      whatsappNum: String,
      landlineNum: String,
      mobileNum: String,
    },
    role: {
      type: Number,
      enum: Object.values(USER_ROLES),
      required: true,
    },
    temporaryPassword: { type: Boolean, default: false },
    status: {
      type: Number,
      enum: Object.values(ACCOUNT_STATUS),
      default: ACCOUNT_STATUS.PENDING,
    },
    vendorInformation: {
      fleetSize: { type: Number },
      documents: {
        ijariCertificate: { url: String, public_id: String },
        tradeLicense: { url: String, public_id: String },
        vatCertificate: { url: String, public_id: String },
        noc: { url: String, public_id: String },
        emiratesId: { url: String, public_id: String },
        poa: { url: String, public_id: String },
      },
    },
    profilePicture: {
      url: String,
      public_id: String,
    },
  },
  { timestamps: true }
);

userSchema.index({ "address.city": 1 });

module.exports = mongoose.model("User", userSchema);
