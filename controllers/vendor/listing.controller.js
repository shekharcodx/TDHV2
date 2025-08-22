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

      // brand
      {
        $lookup: {
          from: "carbrands",
          localField: "carBrand",
          foreignField: "_id",
          as: "carBrand",
          pipeline: [{ $project: { name: 1, logo: 1 } }],
        },
      },
      { $unwind: "$carBrand" },

      // model
      {
        $lookup: {
          from: "carmodels",
          localField: "carModel",
          foreignField: "_id",
          as: "carModel",
          pipeline: [{ $project: { name: 1 } }],
        },
      },
      { $unwind: "$carModel" },

      // trim
      {
        $lookup: {
          from: "trims",
          localField: "carTrim",
          foreignField: "_id",
          as: "carTrim",
          pipeline: [{ $project: { name: 1 } }],
        },
      },
      { $unwind: { path: "$carTrim", preserveNullAndEmptyArrays: true } },

      // year
      {
        $lookup: {
          from: "years",
          localField: "modelYear",
          foreignField: "_id",
          as: "modelYear",
          pipeline: [{ $project: { year: 1 } }],
        },
      },
      { $unwind: "$modelYear" },

      // regional spec
      {
        $lookup: {
          from: "regionalspecs",
          localField: "regionalSpecs",
          foreignField: "_id",
          as: "regionalSpecs",
          pipeline: [{ $project: { name: 1 } }],
        },
      },
      { $unwind: "$regionalSpecs" },

      {
        $lookup: {
          from: "bodytypes",
          localField: "bodyType",
          foreignField: "_id",
          as: "bodyType",
          pipeline: [
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },
      { $unwind: "$bodyType" },

      {
        $lookup: {
          from: "fueltypes",
          localField: "fuelType",
          foreignField: "_id",
          as: "fuelType",
          pipeline: [
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },
      { $unwind: "$fuelType" },

      {
        $lookup: {
          from: "cardoors",
          localField: "carDoors",
          foreignField: "_id",
          as: "carDoors",
          pipeline: [
            {
              $project: {
                doors: 1,
              },
            },
          ],
        },
      },
      { $unwind: "$carDoors" },

      {
        $lookup: {
          from: "transmissions",
          localField: "transmission",
          foreignField: "_id",
          as: "transmission",
          pipeline: [
            {
              $project: {
                transmission: 1,
              },
            },
          ],
        },
      },
      { $unwind: "$transmission" },

      {
        $lookup: {
          from: "seatingcapacities",
          localField: "seatingCapacity",
          foreignField: "_id",
          as: "seatingCapacity",
          pipeline: [
            {
              $project: {
                seats: 1,
              },
            },
          ],
        },
      },
      { $unwind: "$seatingCapacity" },

      {
        $lookup: {
          from: "horsepowers",
          localField: "horsePower",
          foreignField: "_id",
          as: "horsePower",
          pipeline: [
            {
              $project: {
                power: 1,
              },
            },
          ],
        },
      },
      { $unwind: "$horsePower" },

      {
        $lookup: {
          from: "carcolors",
          localField: "interiorColor",
          foreignField: "_id",
          as: "interiorColor",
          pipeline: [
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },
      { $unwind: "$interiorColor" },

      {
        $lookup: {
          from: "carcolors",
          localField: "exteriorColor",
          foreignField: "_id",
          as: "exteriorColor",
          pipeline: [
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },
      { $unwind: "$exteriorColor" },

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
                  techFeatures: "$techFeatures.name",
                  otherFeatures: "$otherFeatures.name",
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
