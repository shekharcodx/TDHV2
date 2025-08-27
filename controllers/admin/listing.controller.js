const messages = require("../../messages/messages");
const adminMessages = require("../../messages/admin");
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

exports.listingStatus = async (req, res) => {
  const { listingId } = req.params;
  const { status } = req.body;
  try {
    const listing = await RentalListing.findById(listingId);

    if (!listing) {
      return res
        .status(404)
        .json({ success: false, ...adminMessages.LISTING_NOT_FOUND });
    }

    listing.status = status;
    await listing.save();

    res
      .status(200)
      .json({ success: true, ...adminMessages.LISTING_STATUS_UPDATED });
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
    const listing = await RentalListing.findByIdAndUpdate(
      listingId,
      { isActive },
      { new: true }
    );

    if (!listing) {
      return res
        .status(404)
        .json({ success: false, ...adminMessages.LISTING_NOT_FOUND });
    }

    res
      .status(200)
      .json({
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
