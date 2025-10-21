const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const { PAYMENT_STATUS, BOOKING_STATUS } = require("../config/constants");

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RentalListing",
      required: true,
    },
    pickupDate: { type: Date, required: true },
    dropoffDate: { type: Date, required: true },
    deliveryRequired: { type: Boolean, default: false },
    priceType: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      required: true,
    },
    totalAmount: { type: Number, required: true },
    refundAmount: { type: Number, default: 0 },
    refundMethod: {
      type: String,
      enum: ["cash", "stripe", "bank"],
      default: null,
    },
    payment: {
      type: Number,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    status: {
      type: Number,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
    },
    // expireAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

bookingSchema.index(
  { listingId: 1, startDate: 1, endDate: 1 },
  { unique: true }
);

bookingSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Booking", bookingSchema);
