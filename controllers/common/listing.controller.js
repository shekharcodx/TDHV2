const messages = require("../../messages/messages");
const adminMessages = require("../../messages/admin");
const RentalListing = require("../../models/rentalListing.model");
const { default: mongoose } = require("mongoose");

exports.getListing = async (req, res) => {
  const { listingId } = req.params;
  const { role, email } = req.user;

  try {
    let pipeline = [
      { $match: { _id: new mongoose.Types.ObjectId(listingId) } },

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
                _id: 1,
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
                _id: 1,
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
              _id: "$carBrand._id",
              name: "$carBrand.name",
              logo: "$carBrand.logo",
              carModel: {
                _id: "$carModel._id",
                name: "$carModel.name",
                details: {
                  trimId: "$carTrim._id",
                  carTrim: "$carTrim.name",
                  yearId: "$modelYear._id",
                  modelYear: "$modelYear.year",
                  bodyTypeId: "$bodyType._id",
                  bodyType: "$bodyType.name",
                  fuelTypeId: "$fuelType._id",
                  fuelType: "$fuelType.name",
                  doorsId: "$carDoors._id",
                  doors: "$carDoors.doors",
                  transmissionId: "$transmission._id",
                  transmission: "$transmission.transmission",
                  seatingCapacityId: "$seatingCapacity._id",
                  seatingCapacity: "$seatingCapacity.seats",
                  horsePowerId: "$horsePower._id",
                  horsePower: "$horsePower.power",
                  interiorColorId: "$interiorColor._id",
                  interiorColor: "$interiorColor.name",
                  exteriorColorId: "$exteriorColor._id",
                  exteriorColor: "$exteriorColor.name",
                  techFeatures: {
                    $map: {
                      input: "$techFeatures",
                      as: "tf",
                      in: {
                        _id: "$$tf._id",
                        name: "$$tf.name",
                      },
                    },
                  },
                  otherFeatures: {
                    $map: {
                      input: "$otherFeatures",
                      as: "of",
                      in: { _id: "$$of._id", name: "$$of.name" },
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
            regionalSpecsId: "$regionalSpecs._id",
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
        },
      },
    ];

    const [listing] = await RentalListing.aggregate(pipeline);

    if (!listing) {
      return res
        .status(404)
        .json({ success: false, ...adminMessages.RESOURCE_NOT_FOUND });
    }

    if (role !== 1 && email !== listing.vendor.email) {
      return res
        .status(403)
        .json({ success: false, ...messages.NOT_AUTHORIZED });
    }

    res.status(200).json({ success: true, listing });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};
