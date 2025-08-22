const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const { LISTING_STATUS } = require("../config/constants");

const rentalListingSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  carBrand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CarBrand",
    required: true,
  },
  carModel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CarModel",
    required: true,
  },
  carTrim: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trim",
    required: true,
  },
  regionalSpecs: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RegionalSpecs",
    required: true,
  },
  modelYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Years",
    required: true,
  },
  mileage: {
    type: Number,
    required: true,
  },
  bodyType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BodyType",
    required: true,
  },
  carInsurance: {
    type: String,
    required: true,
  },
  rentPerDay: { type: Number, required: true },
  rentPerMonth: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String },
  fuelType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FuelType",
    required: true,
  },
  interiorColor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CarColor",
    required: true,
  },
  exteriorColor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CarColor",
    required: true,
  },
  warranty: { type: String, required: true },
  carDoors: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CarDoor",
    required: true,
  },
  transmission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transmission",
    required: true,
  },
  seatingCapacity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SeatingCapacity",
    required: true,
  },
  horsePower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HorsePower",
    required: true,
  },
  techFeatures: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TechnicalFeature",
    },
  ],
  otherFeatures: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OtherFeature",
    },
  ],
  location: { type: String, required: true },
  images: [
    {
      key: { type: String, required: true },
      url: { type: String, required: true },
    },
  ],
  status: {
    type: Number,
    enum: Object.values(LISTING_STATUS),
    default: LISTING_STATUS.PENDING,
  },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isPremium: { type: Boolean, default: false },
});

rentalListingSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("RentalListing", rentalListingSchema);
