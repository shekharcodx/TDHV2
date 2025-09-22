const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const { LISTING_STATUS } = require("../config/constants");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const rentalListingSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

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

    airBags: {
      type: Number,
      required: true,
    },

    tankCapacity: { type: Number, required: true },

    extraMileageRate: { type: Number, required: true },

    carCategory: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "CarCategory" },
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
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Years",
        required: true,
      },
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

    deliveryCharges: { type: Number, required: true },

    tollCharges: { type: Number, required: true },

    securityDeposit: { type: Number },

    dailyMileage: { type: Number, required: true },

    weeklyMileage: { type: Number },

    monthlyMileage: { type: Number, required: true },

    minRentalDays: { type: Number, default: 1 },

    pickupAvailable: { type: Boolean, default: false },

    depositRequired: { type: Boolean, default: false },

    status: {
      type: Number,
      enum: Object.values(LISTING_STATUS),
      default: LISTING_STATUS.PENDING,
    },

    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },

    isBest: { type: Boolean, default: false },
    bestUpdatedAt: { type: Date, default: null },

    isPopular: { type: Boolean, default: false },
    popularUpdatedAt: { type: Date, default: null },

    isTopChoice: { type: Boolean, default: false },
    topChoiceUpdatedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

rentalListingSchema.plugin(mongoosePaginate);
rentalListingSchema.plugin(aggregatePaginate);

module.exports = mongoose.model("RentalListing", rentalListingSchema);
