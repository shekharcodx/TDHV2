const messages = require("../../messages/messages");
const countryModel = require("../../models/country.model");
const stateModel = require("../../models/state.model");
const cityModel = require("../../models/city.model");

const { default: mongoose } = require("mongoose");
const RentalListing = require("../../models/rentalListing.model");
const { uploadFile } = require("../../utils/s3");
const vendorMessages = require("../../messages/vendor");
const sharp = require("sharp");

const brandModel = require("../../models/carBrand.model");
const modelModel = require("../../models/carModel.model");
const trimModel = require("../../models/carTrims.model");
const doorModel = require("../../models/carDoors.model");
const transmissionModel = require("../../models/carTransmission.model");
const fuelTypeModel = require("../../models/carFuelType.model");
const yearModel = require("../../models/years.model");
const regionalSpecsModel = require("../../models/carRegionalSpecs.model");
const colorModel = require("../../models/carColor.model");
const seatingModel = require("../../models/carSeatingCapacity.model");
const horsePowerModel = require("../../models/carHoursePower.model");
const bodyTypeModel = require("../../models/carBodyType.model");

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
      modelModel.findById(req.body.carModel, "name"),
      trimModel.findById(req.body.carTrim, "name"),
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

    console.log({ seats, power });

    let imagesArr = [];

    if (req.files && req.files.length > 0) {
      imagesArr = await Promise.all(
        req.files.map(async (file) => {
          const optimizedImage = await sharp(file.buffer)
            .resize(1280, 720, { fit: "cover" })
            .toFormat("webp") // 👈 convert to webp
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
    });

    await carListing.save();

    res.status(201).json({
      success: true,
      ...vendorMessages.LISTING_CREATED,
      data: carListing,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getListings = async (req, res) => {
  try {
    let pipeline = [
      { $match: { vendor: new mongoose.Types.ObjectId(req.user.id) } },

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
            regionalSpecs: "$regionalSpecs.name",
            carInsurance: "$carInsurance",
            warranty: "$warranty",
            mileage: "$mileage",
            images: "$images",
          },
          rentPerDay: 1,
          rentPerWeek: 1,
          rentPerMonth: 1,
          title: 1,
          description: 1,
          location: 1,
          isActive: 1,
          status: 1,
          isFeatured: 1,
          isPremium: 1,
        },
      },
    ];

    const listings = await RentalListing.aggregate(pipeline);

    res.status(200).json({ success: true, listings });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};
