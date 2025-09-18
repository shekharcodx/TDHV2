const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const { USER_ROLES, ACCOUNT_STATUS } = require("../config/constants");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    //   type: String,
    //   required: function () {
    //     return this.role === USER_ROLES.VENDOR;
    //   },
    // },
    password: { type: String, required: true },
    //   street: String,
    //   country: String,
    //   city: String,
    //   state: String,
    //   mapUrl: String,
    // },
    // contact: {
    //   whatsappNum: String,
    //   landlineNum: String,
    //   mobileNum: String,
    // },
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
    //   fleetSize: { type: Number },
    //   documents: {
    //     ijariCertificate: { key: String, filename: String },
    //     tradeLicense: { key: String, filename: String },
    //     vatCertificate: { key: String, filename: String },
    //     noc: { key: String, filename: String },
    //     emiratesId: { key: String, filename: String },
    //     poa: { key: String, filename: String },
    //   },
    // },
    profilePicture: {
      url: String,
      key: String,
    },
    isActive: { type: Boolean, default: true },
    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.plugin(mongoosePaginate);
userSchema.plugin(aggregatePaginate);

module.exports = mongoose.model("User", userSchema);
