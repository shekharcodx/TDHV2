const messages = require("../../messages/messages");
const adminMessages = require("../../messages/admin");
const RentalListing = require("../../models/rentalListing.model");
const { LISTING_STATUS } = require("../../config/constants");

exports.getAllListings = async (req, res) => {
  const { status, isActive, search } = req.query;

  const options = {
    page: req.query.page || 1,
    limit: req.query.limit || 10,
  };

  try {
    let pipeline = [
      {
        $match: {
          ...(status ? { status: parseInt(status) } : {}),
          ...(isActive ? { isActive: isActive === "true" } : {}),
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
          pipeline: [{ $project: { name: 1 } }],
        },
      },
      {
        $lookup: {
          from: "otherfeatures",
          localField: "otherFeatures",
          foreignField: "_id",
          as: "otherFeatures",
          pipeline: [{ $project: { name: 1 } }],
        },
      },
    ];

    // 🔍 Apply search filter
    if (search && search.trim() !== "") {
      const regex = new RegExp(search, "i"); // case-insensitive search
      pipeline.push({
        $match: {
          $or: [
            { title: regex },
            { "vendor.name": regex },
            { "carBrand.name": regex },
            { "carModel.name": regex },
          ],
        },
      });
    }

    // final shape
    pipeline.push({
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
                  $map: { input: "$techFeatures", as: "tf", in: "$$tf.name" },
                },
                otherFeatures: {
                  $map: { input: "$otherFeatures", as: "of", in: "$$of.name" },
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
    });

    const listings = await RentalListing.aggregatePaginate(pipeline, options);

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

    if (
      (listing.status === LISTING_STATUS.APPROVED ||
        listing.status === LISTING_STATUS.ON_HOLD) &&
      status === LISTING_STATUS.PENDING
    ) {
      return res.status(400).json({
        success: false,
        ...adminMessages.LISTING_CANNOT_BE_REVERTED_TO_PENDING,
      });
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

exports.listingCategory = async (req, res) => {
  try {
    const { listingId } = req.params;
    const { isFeatured, isPremium } = req.body;

    let data = {};
    if (typeof isFeatured !== "undefined") {
      data.isFeatured = isFeatured;
    }
    if (typeof isPremium !== "undefined") {
      data.isPremium = isPremium;
    }

    const rentalListing = await RentalListing.findOneAndUpdate(
      { _id: listingId },
      { $set: data },
      {
        new: true,
      }
    );

    if (!rentalListing) {
      return res
        .status(404)
        .json({ success: false, message: "Listing not found" });
    }

    res.status(200).json({ success: true, data: rentalListing });
  } catch (err) {
    console.log("Listing Category Error", err);
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};
