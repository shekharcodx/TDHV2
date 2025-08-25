const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const { LISTING_STATUS } = require("../config/constants");

const rentalListingSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  carBrand: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarBrand",
      required: true,
    },
    name: { type: String, required: true },
    logo: {
      url: { type: String, required: true },
      key: { type: String, required: true },
    },
  },

  carModel: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarModel",
      required: true,
    },
    name: { type: String, required: true },
  },

  carTrim: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "Trim" },
    name: { type: String },
  },

  regionalSpecs: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RegionalSpecs",
      required: true,
    },
    name: { type: String, required: true },
  },

  modelYear: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "Years", required: true },
    year: { type: Number, required: true },
  },

  mileage: { type: Number, required: true },

  bodyType: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BodyType",
      required: true,
    },
    name: { type: String, required: true },
  },

  carInsurance: { type: String, required: true },

  rentPerDay: { type: Number, required: true },
  rentPerWeek: { type: Number, required: true },
  rentPerMonth: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String },

  fuelType: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FuelType",
      required: true,
    },
    name: { type: String, required: true },
  },

  interiorColor: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarColor",
      required: true,
    },
    name: { type: String, required: true },
  },

  exteriorColor: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarColor",
      required: true,
    },
    name: { type: String, required: true },
  },

  warranty: { type: String, required: true },

  carDoors: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarDoor",
      required: true,
    },
    doors: { type: Number, required: true },
  },

  transmission: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transmission",
      required: true,
    },
    transmission: { type: String, required: true },
  },

  seatingCapacity: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SeatingCapacity",
      required: true,
    },
    seats: { type: Number, required: true },
  },

  horsePower: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HorsePower",
      required: true,
    },
    power: { type: Number, required: true },
  },

  techFeatures: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TechnicalFeature",
    },
  ],

  otherFeatures: [
    { type: mongoose.Schema.Types.ObjectId, ref: "OtherFeature" },
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
