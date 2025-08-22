const RentalListing = require("../../models/rentalListing.model");

exports.getAllListings = async (req, res) => {
  try {
    let pipeline = [
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
