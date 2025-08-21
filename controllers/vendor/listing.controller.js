const messages = require("../../messages/messages");
const countryModel = require("../../models/country.model");
const stateModel = require("../../models/state.model");
const cityModel = require("../../models/city.model");
const { default: mongoose } = require("mongoose");
const RentalListing = require("../../models/rentalListing.model");
const { uploadFile } = require("../../utils/s3");
const vendorMessages = require("../../messages/vendor");
const sharp = require("sharp");

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
      carBrand: req.body.carBrand,
      carModel: req.body.carModel,
      carTrim: req.body.carTrim,
      regionalSpecs: req.body.regionalSpecs,
      modelYear: req.body.modelYear,
      mileage: req.body.mileage,
      bodyType: req.body.bodyType,
      carInsurance: req.body.carInsurance,
      rentPerDay: req.body.rentPerDay,
      rentPerMonth: req.body.rentPerMonth,
      title: req.body.title,
      description: req.body.description,
      fuelType: req.body.fuelType,
      interiorColor: req.body.interiorColor,
      exteriorColor: req.body.exteriorColor,
      warranty: req.body.warranty,
      carDoors: req.body.carDoors,
      transmission: req.body.transmission,
      seatingCapacity: req.body.seatingCapacity,
      horsePower: req.body.horsePower,
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
      .json({ success: true, ...messages.INTERNAL_SERVER_ERROR });
  }
};
