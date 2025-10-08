exports.USER_ROLES = {
  ADMIN: 1,
  VENDOR: 2,
  CUSTOMER: 3,
};

exports.ACCOUNT_STATUS = {
  PENDING: 1,
  APPROVED: 2,
  ON_HOLD: 3,
  BLOCKED: 4,
};

exports.ACCOUNT_STATUS_NUM = {
  1: "PENDING",
  2: "APPROVED",
  3: "ON_HOLD",
  4: "BLOCKED",
};

exports.LISTING_STATUS = {
  PENDING: 1,
  APPROVED: 2,
  ON_HOLD: 3,
};

exports.PAYMENT_STATUS = {
  PENDING: 1,
  PAYED: 2,
  REFUNDED: 3,
};

exports.BOOKING_STATUS = {
  PENDING: 1,
  CONFIRMED: 2,
  CANCELED: 3,
  EXPIRED: 4,
};

exports.createCarProjection = () => {
  return {
    vendor: 1,
    // vendorDetails: "$vendor.vendorDetails",
    car: {
      carBrand: {
        _id: "$carBrand._id",
        name: "$carBrand.name",
        logo: "$carBrand.logo",
      },
      carModel: "$carModel.name",
      carTrim: "$carTrim.name",
      modelYear: "$modelYear.year",
      bodyType: "$bodyType.name",
      fuelType: "$fuelType.name",
      doors: "$carDoors.doors",
      transmission: "$transmission.transmission",
      seatingCapacity: "$seatingCapacity.seats",
      horsePower: "$horsePower.power",
      interiorColor: "$interiorColor.name",
      exteriorColor: "$exteriorColor.name",
      techFeatures: {
        $map: { input: "$techFeatures", as: "tf", in: "$$tf.name" },
      },
      otherFeatures: {
        $map: { input: "$otherFeatures", as: "of", in: "$$of.name" },
      },
      airBags: "$airBags",
      tankCapacity: "$tankCapacity",
      dailyMileage: "$dailyMileage",
      weeklyMileage: "$weeklyMileage",
      monthlyMileage: "$monthlyMileage",
      category: "$carCategory.name",
      categoryId: "$carCategory._id",
      regionalSpecs: "$regionalSpecs.name",
      carInsurance: "$carInsurance",
      warranty: "$warranty",
      mileage: "$mileage",
      images: "$images",
      coverImage: "$coverImage",
    },
    rentPerDay: 1,
    rentPerWeek: 1,
    rentPerMonth: 1,
    extraMileageRate: 1,
    deliveryCharges: 1,
    tollCharges: 1,
    securityDeposit: 1,
    minRentalDays: 1,
    pickupAvailable: 1,
    depositRequired: 1,
    title: 1,
    description: 1,
    location: 1,
    isActive: 1,
    status: 1,
    isFeatured: 1,
    isPremium: 1,
  };
};

exports.vendorLookup = () => {
  return {
    from: "users",
    localField: "vendor",
    foreignField: "_id",
    as: "vendor",
    pipeline: [
      {
        $project: {
          name: 1,
          email: 1,
          _id: 1,
          address: 1,
          contact: 1,
          profilePicture: 1,
        },
      },
      {
        $lookup: {
          from: "vendordetails",
          let: { vendorId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$userId", "$$vendorId"] } } },
            { $project: { businessName: 1, address: 1, contact: 1, _id: 0 } },
          ],
          as: "vendorDetails",
        },
      },
      { $unwind: { path: "$vendorDetails", preserveNullAndEmptyArrays: true } },
    ],
  };
};

exports.featuresLookup = (collection) => {
  return {
    from: collection,
    localField:
      collection === "technicalfeatures" ? "techFeatures" : "otherFeatures",
    foreignField: "_id",
    as: collection === "technicalfeatures" ? "techFeatures" : "otherFeatures",
    pipeline: [{ $project: { name: 1 } }],
  };
};
