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
                  {
                    $project: {
                      businessName: 1,
                      address: 1,
                      contact: 1,
                      _id: 0,
                    },
                  },
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
      $project: createCarProjection(),
    });

    const listings = await RentalListing.aggregatePaginate(pipeline, options);

    res.status(200).json({ success: true, listings });
  } catch (err) {
    console.log("Frontend All listings error", err);
    return res
      .status(500)
      .json({ success: true, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getCarouselListings = async (req, res) => {
  try {
    let pipeline = [
      {
        $match: {
          status: LISTING_STATUS.APPROVED,
          isActive: true,
        },
      },

      // Vendor lookup
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
                  {
                    $project: {
                      businessName: 1,
                      address: 1,
                      contact: 1,
                      _id: 0,
                    },
                  },
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

      // Technical Features Lookup
      {
        $lookup: {
          from: "technicalfeatures",
          localField: "techFeatures",
          foreignField: "_id",
          as: "techFeatures",
          pipeline: [{ $project: { name: 1 } }],
        },
      },

      // Other Features Lookup
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

    // Group cars based on category flags (bestCars, popularCars, topChoice)
    pipeline.push({
      $facet: {
        allCars: [
          { $project: createCarProjection() },
          { $limit: 10 },
          { $sort: { createdAt: -1 } },
        ],
        bestCars: [
          {
            $match: {
              isBest: true,
            },
          },
          { $project: createCarProjection() },
          { $limit: 10 },
          { $sort: { bestUpdatedAt: -1 } },
        ],
        popularCars: [
          { $match: { isPopular: true } },
          { $project: createCarProjection() },
          { $limit: 10 },
          { $sort: { popularUpdatedAt: -1 } },
        ],
        topChoice: [
          { $match: { isTopChoice: true } },
          { $project: createCarProjection() },
          { $limit: 10 },
          { $sort: { topChoiceUpdatedAt: -1 } },
        ],
        carBrands: [
          {
            $lookup: {
              from: "carbrands",
              pipeline: [
                { $match: { isActive: true } },
                { $project: { _id: 1, name: 1, logo: 1 } },
                { $sort: { name: 1 } }, // or popularScore if available
                { $limit: 10 },
              ],
              as: "brands",
            },
          },
          { $unwind: "$brands" },
          { $replaceRoot: { newRoot: "$brands" } },
        ],
        categories: [
          {
            $project: createCarProjection(), // 👈 apply here
          },
          {
            $lookup: {
              from: "carcategories",
              let: { categoryId: "$car.categoryId" }, // pass variable
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$_id", "$$categoryId"] }, // join condition
                        { $eq: ["$isActive", true] }, // only active categories
                      ],
                    },
                  },
                },
              ],
              as: "categoryData",
            },
          },
          { $unwind: "$categoryData" },

          {
            $group: {
              _id: "$categoryData._id",
              name: { $first: "$categoryData.name" },
              listings: { $push: "$$ROOT" }, // $$ROOT is now already projected ✅
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              listings: { $slice: ["$listings", 10] }, // limit to 10 ✅
            },
          },
          { $sort: { name: 1 } },
        ],
      },
    });

    const listings = await RentalListing.aggregate(pipeline);

    res.status(200).json({ success: true, data: listings });
  } catch (err) {
    console.log("Frontend Carousel listings error", err);
    return res
      .status(500)
      .json({ success: true, ...messages.INTERNAL_SERVER_ERROR });
  }
};

// Helper function to create the common projection structure for each car
function createCarProjection() {
  return {
    vendor: 1,
    // vendorDetails: "$vendor.vendorDetails",
    car: {
      carBrand: {
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
}
