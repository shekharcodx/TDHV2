const messages = require("../../messages/messages");
const adminMessages = require("../../messages/admin");
const countryModel = require("../../models/locationModels/country.model");
const stateModel = require("../../models/locationModels/state.model");
const cityModel = require("../../models/locationModels/city.model");

const { default: mongoose } = require("mongoose");
const RentalListing = require("../../models/rentalListing.model");
const { uploadFile } = require("../../utils/s3");
const vendorMessages = require("../../messages/vendor");
const sharp = require("sharp");

const brandModel = require("../../models/carModels/carBrand.model");
const modelModel = require("../../models/carModels/carModel.model");
const trimModel = require("../../models/carModels/carTrims.model");
const doorModel = require("../../models/carModels/carDoors.model");
const transmissionModel = require("../../models/carModels/carTransmission.model");
const fuelTypeModel = require("../../models/carModels/carFuelType.model");
const yearModel = require("../../models/carModels/years.model");
const regionalSpecsModel = require("../../models/carModels/carRegionalSpecs.model");
const colorModel = require("../../models/carModels/carColor.model");
const seatingModel = require("../../models/carModels/carSeatingCapacity.model");
const horsePowerModel = require("../../models/carModels/carHoursePower.model");
const bodyTypeModel = require("../../models/carModels/carBodyType.model");
const CarCategory = require("../../models/carModels/carCategory.model");
const { USER_ROLES } = require("../../config/constants");

exports.getCountriesData = async (req, res) => {
  try {
    const pipeline = [
      {
        $match: { isActive: true }, // ✅ only active countries
      },
      {
        $lookup: {
          from: "states",
          let: { countryId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$country", "$$countryId"] },
                    { $eq: ["$isActive", true] }, // ✅ only active states
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "cities",
                let: { stateId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$state", "$$stateId"] },
                          { $eq: ["$isActive", true] }, // ✅ only active cities
                        ],
                      },
                    },
                  },
                ],
                as: "cities",
              },
            },
          ],
          as: "states",
        },
      },
    ];

    const countries = await countryModel.aggregate(pipeline);

    res.status(200).json({ success: true, countries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getCountries = async (req, res) => {
  try {
    const countries = await countryModel
      .find({ isActive: true })
      .select("_id name code");
    res.status(200).json({ success: true, countries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getStates = async (req, res) => {
  const { countryId } = req.params;
  try {
    const states = await stateModel
      .find({ country: countryId, isActive: true })
      .select("_id name country")
      .populate({ path: "country", select: "name" });
    res.status(200).json({ success: true, states });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getCities = async (req, res) => {
  const { stateId } = req.params;
  try {
    const cities = await cityModel
      .find({ state: stateId, isActive: true })
      .select("_id name state")
      .populate({ path: "state", select: "name" });
    res.status(200).json({ success: true, cities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.createListing = async (req, res) => {
  try {
    const [
      brand,
      model,
      trim,
      category,
      specs,
      year,
      bodyType,
      fuelType,
      interiorColor,
      exteriorColor,
      transmission,
      doors,
      seats,
      power,
    ] = await Promise.all([
      brandModel.findById(req.body.carBrand, "name logo"),
      modelModel.findById(req.body.carModel, "carBrand name"),
      trimModel.findById(req.body.carTrim, "carModel name"),
      CarCategory.findById(req.body.carCategory, "name"),
      regionalSpecsModel.findById(req.body.regionalSpecs, "name"),
      yearModel.findById(req.body.modelYear, "year"),
      bodyTypeModel.findById(req.body.bodyType, "name"),
      fuelTypeModel.findById(req.body.fuelType, "name"),
      colorModel.findById(req.body.interiorColor, "name"),
      colorModel.findById(req.body.exteriorColor, "name"),
      transmissionModel.findById(req.body.transmission, "transmission"),
      doorModel.findById(req.body.carDoors, "doors"),
      seatingModel.findById(req.body.seatingCapacity, "seats"),
      horsePowerModel.findById(req.body.horsePower, "power"),
    ]);

    if (
      !brand ||
      !model ||
      !trim ||
      !category ||
      !year ||
      !specs ||
      !bodyType ||
      !fuelType ||
      !interiorColor ||
      !exteriorColor ||
      !transmission ||
      !doors ||
      !seats ||
      !power
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid reference provided" });
    }

    if (
      brand._id.toString() !== model.carBrand.toString() ||
      trim.carModel.toString() !== model._id.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, ...vendorMessages.UNRELATED_CAR_DATA });
    }

    let imagesArr = [];

    if (req.files && req.files.length > 0) {
      imagesArr = await Promise.all(
        req.files.map(async (file) => {
          const optimizedImage = await sharp(file.buffer)
            .resize(1280, 720, { fit: "inside" }) // keeps aspect ratio, no crop
            .toFormat("webp")
            .webp({ quality: 80 })
            .toBuffer();
          const result = await uploadFile(
            optimizedImage,
            "listing_images",
            file.originalname,
            null,
            {
              contentType: "image/webp",
              extension: ".webp",
            }
          );
          return { url: result.url, key: result.key };
        })
      );
    }

    const carListing = new RentalListing({
      vendor: req.user.id, // from auth middleware
      carBrand: {
        _id: req.body.carBrand,
        name: brand.name,
        logo: brand.logo,
      },
      carModel: { _id: req.body.carModel, name: model.name },
      carTrim: { _id: req.body.carTrim, name: trim.name },
      carCategory: { _id: req.body.carCategory, name: category.name },
      regionalSpecs: { _id: req.body.regionalSpecs, name: specs.name },
      modelYear: { _id: req.body.modelYear, year: year.year },
      mileage: req.body.mileage,
      bodyType: { _id: req.body.bodyType, name: bodyType.name },
      carInsurance: req.body.carInsurance,
      rentPerDay: req.body.rentPerDay,
      rentPerWeek: req.body.rentPerWeek,
      rentPerMonth: req.body.rentPerMonth,
      title: req.body.title,
      description: req.body.description,
      fuelType: { _id: req.body.fuelType, name: fuelType.name },
      interiorColor: {
        _id: req.body.interiorColor,
        name: interiorColor.name,
      },
      exteriorColor: {
        _id: req.body.exteriorColor,
        name: exteriorColor.name,
      },
      warranty: req.body.warranty,
      carDoors: { _id: req.body.carDoors, doors: doors.doors },
      transmission: {
        _id: req.body.transmission,
        transmission: transmission.transmission,
      },
      seatingCapacity: { _id: req.body.seatingCapacity, seats: seats.seats },
      horsePower: { _id: req.body.horsePower, power: power.power },
      techFeatures: req.body.techFeatures,
      otherFeatures: req.body.otherFeatures,
      location: req.body.location,
      images: imagesArr,
      airBags: req.body.airBags,
      tankCapacity: req.body.tankCapacity,
      extraMileageRate: req.body.extraMileageRate,
      deliveryCharges: req.body.deliveryCharges,
      tollCharges: req.body.tollCharges,
      securityDeposit: req.body.securityDeposit,
      dailyMileage: req.body.dailyMileage,
      weeklyMileage: req.body.weeklyMileage,
      monthlyMileage: req.body.monthlyMileage,
      minRentalDays: req.body.minRentalDays,
      pickupAvailable: req.body.pickupAvailable,
      depositRequired: req.body.depositRequired,
    });

    await carListing.save();

    res.status(201).json({
      success: true,
      ...vendorMessages.LISTING_CREATED,
      data: carListing,
    });
  } catch (err) {
    console.log("listing creation err", err);
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getListings = async (req, res) => {
  const { status, isActive } = req.query;
  const options = {
    page: req.query.page || 1,
    limit: req.query.limit || 10,
    sort: { createdAt: -1 },
  };
  try {
    let pipeline = [
      {
        $match: {
          vendor: new mongoose.Types.ObjectId(req.user.id),
          ...(status ? { status: Number(status) } : {}),
          ...(isActive !== undefined ? { isActive: isActive === "true" } : {}),
        },
      },

      // vendor
      {
        $lookup: {
          from: "users",
          localField: "vendor",
          foreignField: "_id",
          as: "vendor",
          pipeline: [
            { $project: { name: 1, email: 1, _id: 0, address: 1, contact: 1 } },
          ],
        },
      },
      { $unwind: "$vendor" },

      {
        $lookup: {
          from: "technicalfeatures",
          localField: "techFeatures",
          foreignField: "_id",
          as: "techFeatures",
          pipeline: [
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },

      {
        $lookup: {
          from: "otherfeatures",
          localField: "otherFeatures",
          foreignField: "_id",
          as: "otherFeatures",
          pipeline: [
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },

      // final shape
      {
        $project: {
          vendor: 1,
          car: {
            carBrand: {
              name: "$carBrand.name",
              logo: "$carBrand.logo",
              carModel: {
                name: "$carModel.name",
                details: {
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
                    $map: {
                      input: "$techFeatures",
                      as: "tf",
                      in: "$$tf.name",
                    },
                  },
                  otherFeatures: {
                    $map: {
                      input: "$otherFeatures",
                      as: "of",
                      in: "$$of.name",
                    },
                  },
                },
              },
            },
            airBags: "$airBags",
            tankCapacity: "$tankCapacity",
            dailyMileage: "$dailyMileage",
            weeklyMileage: "$weeklyMileage",
            monthlyMileage: "$monthlyMileage",
            category: "$carCategory.name",
            regionalSpecs: "$regionalSpecs.name",
            carInsurance: "$carInsurance",
            warranty: "$warranty",
            mileage: "$mileage",
            images: "$images",
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
          createdAt: 1,
        },
      },
    ];

    // const listings = await RentalListing.aggregate(pipeline);

    const listings = await RentalListing.aggregatePaginate(pipeline, options);

    res.status(200).json({ success: true, listings });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.listingIsActive = async (req, res) => {
  const { listingId } = req.params;
  const { isActive } = req.body;
  try {
    const listing = await RentalListing.findById(listingId);

    if (!listing) {
      return res
        .status(404)
        .json({ success: false, ...adminMessages.LISTING_NOT_FOUND });
    }

    if (listing?.vendor.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, ...messages.NOT_AUTHORIZED });
    }

    listing.isActive = isActive;
    await listing.save();

    res.status(200).json({
      success: true,
      ...adminMessages.LISTING_STATUS_UPDATED,
      data: listing,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.updateListing = async (req, res) => {
  const { listingId } = req.params;
  const body = req.body || {};

  try {
    const listing = await RentalListing.findById(listingId);

    if (!listing) {
      return res
        .status(404)
        .json({ success: false, message: "Listing not found" });
    }

    if (
      req.user.role === USER_ROLES.VENDOR &&
      listing.vendor.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ success: false, ...messages.NOT_AUTHORIZED });
    }

    // Fetch reference data
    const [
      brand,
      model,
      trim,
      specs,
      year,
      bodyType,
      fuelType,
      interiorColor,
      exteriorColor,
      transmission,
      doors,
      seats,
      power,
    ] = await Promise.all([
      body.carBrand ? brandModel.findById(body.carBrand, "name logo") : null,
      body.carModel
        ? modelModel.findById(body.carModel, "name carBrand")
        : null,
      body.carTrim ? trimModel.findById(body.carTrim, "name carModel") : null,
      body.regionalSpecs
        ? regionalSpecsModel.findById(body.regionalSpecs, "name")
        : null,
      body.modelYear ? yearModel.findById(body.modelYear, "year") : null,
      body.bodyType ? bodyTypeModel.findById(body.bodyType, "name") : null,
      body.fuelType ? fuelTypeModel.findById(body.fuelType, "name") : null,
      body.interiorColor
        ? colorModel.findById(body.interiorColor, "name")
        : null,
      body.exteriorColor
        ? colorModel.findById(body.exteriorColor, "name")
        : null,
      body.transmission
        ? transmissionModel.findById(body.transmission, "transmission")
        : null,
      body.carDoors ? doorModel.findById(body.carDoors, "doors") : null,
      body.seatingCapacity
        ? seatingModel.findById(body.seatingCapacity, "seats")
        : null,
      body.horsePower
        ? horsePowerModel.findById(body.horsePower, "power")
        : null,
    ]);

    // Validate references if provided
    const invalidRefs = [];
    if (body.carBrand && !brand) invalidRefs.push("carBrand");
    if (body.carModel && !model) invalidRefs.push("carModel");
    if (body.carTrim && !trim) invalidRefs.push("carTrim");
    if (body.modelYear && !year) invalidRefs.push("modelYear");
    if (body.regionalSpecs && !specs) invalidRefs.push("regionalSpecs");
    if (body.bodyType && !bodyType) invalidRefs.push("bodyType");
    if (body.fuelType && !fuelType) invalidRefs.push("fuelType");
    if (body.interiorColor && !interiorColor) invalidRefs.push("interiorColor");
    if (body.exteriorColor && !exteriorColor) invalidRefs.push("exteriorColor");
    if (body.transmission && !transmission) invalidRefs.push("transmission");
    if (body.carDoors && !doors) invalidRefs.push("carDoors");
    if (body.seatingCapacity && !seats) invalidRefs.push("seatingCapacity");
    if (body.horsePower && !power) invalidRefs.push("horsePower");

    if (invalidRefs.length > 0) {
      return res.status(400).json({
        success: false,
        code: 2070,
        error: "INVALID_REFS",
        message: `Invalid references: ${invalidRefs.join(", ")}`,
      });
    }

    if (
      brand._id.toString() !== model.carBrand.toString() ||
      trim.carModel.toString() !== model._id.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, ...vendorMessages.UNRELATED_CAR_DATA });
    }

    // Handle images
    let imagesArr = listing.images || [];
    if (req.files && req.files.length > 0) {
      const uploadedImages = await Promise.all(
        req.files.map(async (file, i) => {
          const optimizedImage = await sharp(file.buffer)
            .resize(1280, 720, { fit: "inside" }) // keeps aspect ratio, no crop
            .toFormat("webp")
            .webp({ quality: 80 })
            .toBuffer();

          const result = await uploadFile(
            optimizedImage,
            "listing_images",
            file.originalname,
            listing.images[i]?.key || null,
            { contentType: "image/webp", extension: ".webp" }
          );
          return { url: result.url, key: result.key };
        })
      );
      imagesArr = uploadedImages;
    }

    // Update fields if provided
    if (brand)
      listing.carBrand = {
        _id: body.carBrand,
        name: brand.name,
        logo: brand.logo,
      };
    if (model) listing.carModel = { _id: body.carModel, name: model.name };
    if (trim) listing.carTrim = { _id: body.carTrim, name: trim.name };
    if (specs)
      listing.regionalSpecs = { _id: body.regionalSpecs, name: specs.name };
    if (year) listing.modelYear = { _id: body.modelYear, year: year.year };
    if (body.mileage !== undefined) listing.mileage = body.mileage;
    if (bodyType)
      listing.bodyType = { _id: body.bodyType, name: bodyType.name };
    if (body.carInsurance) listing.carInsurance = body.carInsurance;
    if (body.rentPerDay !== undefined) listing.rentPerDay = body.rentPerDay;
    if (body.rentPerWeek !== undefined) listing.rentPerWeek = body.rentPerWeek;
    if (body.rentPerMonth !== undefined)
      listing.rentPerMonth = body.rentPerMonth;
    if (body.title) listing.title = body.title;
    if (body.description) listing.description = body.description;
    if (fuelType)
      listing.fuelType = { _id: body.fuelType, name: fuelType.name };
    if (interiorColor)
      listing.interiorColor = {
        _id: body.interiorColor,
        name: interiorColor.name,
      };
    if (exteriorColor)
      listing.exteriorColor = {
        _id: body.exteriorColor,
        name: exteriorColor.name,
      };
    if (body.warranty) listing.warranty = body.warranty;
    if (doors) listing.carDoors = { _id: body.carDoors, doors: doors.doors };
    if (transmission)
      listing.transmission = {
        _id: body.transmission,
        transmission: transmission.transmission,
      };
    if (seats)
      listing.seatingCapacity = {
        _id: body.seatingCapacity,
        seats: seats.seats,
      };
    if (power)
      listing.horsePower = { _id: body.horsePower, power: power.power };
    if (body.techFeatures) listing.techFeatures = body.techFeatures;
    if (body.otherFeatures) listing.otherFeatures = body.otherFeatures;
    if (body.location) listing.location = body.location;
    if (body.airBags) listing.airBags = req.body.airBags;
    if (body.tankCapacity) listing.tankCapacity = req.body.tankCapacity;
    if (body.extraMileageRate !== undefined)
      listing.extraMileageRate = req.body.extraMileageRate;
    if (body.deliveryCharges !== undefined)
      listing.deliveryCharges = req.body.deliveryCharges;
    if (body.tollCharges !== undefined)
      listing.tollCharges = req.body.tollCharges;
    if (body.securityDeposit !== undefined)
      listing.securityDeposit = req.body.securityDeposit;
    if (body.dailyMileage !== undefined)
      listing.dailyMileage = req.body.dailyMileage;
    if (body.weeklyMileage !== undefined)
      listing.weeklyMileage = req.body.weeklyMileage;
    if (body.monthlyMileage !== undefined)
      listing.monthlyMileage = req.body.monthlyMileage;
    if (body.minRentalDays !== undefined)
      listing.minRentalDays = req.body.minRentalDays;
    if (body.pickupAvailable)
      listing.pickupAvailable = req.body.pickupAvailable;
    if (body.depositRequired)
      listing.depositRequired = req.body.depositRequired;
    listing.images = imagesArr;

    await listing.save();

    res.status(200).json({
      success: true,
      ...vendorMessages.LISTING_UPDATED,
      data: listing,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};
