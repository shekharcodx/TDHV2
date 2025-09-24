const { LISTING_STATUS } = require("../../config/constants");
const messages = require("../../messages/messages");
const RentalListing = require("../../models/rentalListing.model");

exports.getAllListings = async (req, res) => {
  const { search } = req.query;

  const options = {
    page: req.query.page || 1,
    limit: req.query.limit || 10,
    sort: { createdAt: 1 },
  };

  try {
    let pipeline = [
      {
        $match: {
          status: LISTING_STATUS.APPROVED,
          isActive: true,
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
            {
              $project: {
                name: 1,
                email: 1,
                _id: 1,
                address: 1,
                contact: 1,
              },
            },
            {
              $lookup: {
                from: "vendordetails",
                let: { vendorId: "$_id" }, // pass _id to inner lookup
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$userId", "$$vendorId"] }, // compare userId with outer _id
                    },
                  },
                  { $project: { businessName: 1, _id: 0 } },
                ],
                as: "vendorDetails",
              },
            },
            {
              $unwind: {
                path: "$vendorDetails",
                preserveNullAndEmptyArrays: true,
              },
            },
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
        vendorDetails: "$vendor.vendorDetails",
        car: {
          carBrand: {
            name: "$carBrand.name",
            logo: "$carBrand.logo",
          },
          carModel: "$carModel.name",

          // details: {
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
          // },
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
      },
    });

    const listings = await RentalListing.aggregatePaginate(pipeline, options);

    res.status(200).json({ success: true, listings });
  } catch (err) {
    console.log("Frontend listings error", err);
    return res
      .status(500)
      .json({ success: true, ...messages.INTERNAL_SERVER_ERROR });
  }
};
