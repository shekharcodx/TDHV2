const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const { USER_ROLES, ACCOUNT_STATUS } = require("../config/constants");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
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
