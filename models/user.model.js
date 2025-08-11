const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: Number, enum: [1, 2, 3], required: true }, // 1=Admin, 2=Vendor, 3=Customer
    status: {
      type: Number,
      enum: [1, 2],
      default: 1,
    }, // Vendor control
    profilePicture: {
      url: { type: String },
      public_id: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
