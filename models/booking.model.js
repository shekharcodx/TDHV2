const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");
const { PAYMENT_STATUS, BOOKING_STATUS } = require("../config/constants");

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, unique: true, required: true },
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
    totalWithoutSecurity: { type: Number, required: true },
    securityDeposit: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    dropoffAddress: { type: String, required: false },
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
    rentalPaid: {
      type: Boolean,
      default: false,
    },
    depositPaid: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Number,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
    },
    stripeRentalSessionId: {
      type: String,
      default: null,
    },
    stripeDepositSessionId: {
      type: String,
      default: null,
    },
    // expireAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// bookingSchema.index(
//   { listing: 1, pickupDate: 1, dropoffDate: 1 },
//   { unique: true }
// );

bookingSchema.plugin(mongoosePaginate);
bookingSchema.plugin(mongooseAggregatePaginate);

module.exports = mongoose.model("Booking", bookingSchema);
