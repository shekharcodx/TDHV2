const { default: mongoose } = require("mongoose");
const {
  LISTING_STATUS,
  vendorLookup,
  createCarProjection,
  featuresLookup,
} = require("../../config/constants");
const messages = require("../../messages/messages");
const carcategories = require("../../models/carModels/carCategory.model");
const CarBrand = require("../../models/carModels/carBrand.model");
const BodyType = require("../../models/carModels/carBodyType.model");
const Transmission = require("../../models/carModels/carTransmission.model");
const RentalListing = require("../../models/rentalListing.model");
const User = require("../../models/user.model");
const Category = require("../../models/carModels/carCategory.model");
const Brand = require("../../models/carModels/carBrand.model");
const escapeRegex = require("../../utils/escapeRegex");
const Fuse = require("fuse.js");

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
        $lookup: vendorLookup(),
      },
      {
        $unwind: {
          path: "$vendor",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Technical Features Lookup
      {
        $lookup: featuresLookup("technicalfeatures"),
      },

      // Other Features Lookup
      {
        $lookup: featuresLookup("otherfeatures"),
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
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
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
        $lookup: vendorLookup(),
      },
      {
        $unwind: {
          path: "$vendor",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $match: {
          "vendor.isActive": true,
        },
      },

      // Technical Features Lookup
      {
        $lookup: featuresLookup("technicalfeatures"),
      },

      // Other Features Lookup
      {
        $lookup: featuresLookup("otherfeatures"),
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
        featured: [
          { $match: { isFeatured: true } },
          { $project: createCarProjection() },
          { $limit: 10 },
          { $sort: { featuredUpdatedAt: -1 } },
        ],
        premium: [
          { $match: { isPremium: true } },
          { $project: createCarProjection() },
          { $limit: 10 },
          { $sort: { premiumUpdatedAt: -1 } },
        ],
        carBrands: [
          {
            $project: createCarProjection(),
          },
          {
            $lookup: {
              from: "carbrands",
              let: { brandId: "$car.carBrand._id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$_id", "$$brandId"] },
                        { $eq: ["$isActive", true] },
                      ],
                    },
                  },
                },
                { $project: { _id: 1, name: 1, logo: 1, createdAt: 1 } },
              ],
              as: "brands",
            },
          },
          { $unwind: "$brands" },
          {
            $group: {
              _id: "$brands._id",
              name: { $first: "$brands.name" },
              logo: { $first: "$brands.logo" },
              createdAt: { $first: "$brands.createdAt" },
            },
          },
          { $sort: { createdAt: -1 } },
          {
            $project: {
              _id: 1,
              name: 1,
              logo: 1,
            },
          },
          { $limit: 20 },
        ],
        allBrands: [
          {
            $lookup: {
              from: "carbrands",
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$isActive", true] },
                  },
                },
                {
                  $sort: { createdAt: -1 },
                },
                {
                  $project: {
                    _id: 1,
                    name: 1,
                    createdAt: 1,
                  },
                },
              ],
              as: "brands",
            },
          },
          {
            $unwind: {
              path: "$brands",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $replaceRoot: { newRoot: "$brands" },
          },
          {
            $group: {
              _id: "$_id", // ensures unique brands
              name: { $first: "$name" },
              createdAt: { $first: "$createdAt" },
            },
          },
          {
            $sort: { createdAt: -1 },
          },
        ],
        allBodyTypes: [
          {
            $lookup: {
              from: "bodytypes",
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$isActive", true] },
                  },
                },
                {
                  $sort: { createdAt: -1 },
                },
                {
                  $project: {
                    _id: 1,
                    name: 1,
                    createdAt: 1,
                  },
                },
              ],
              as: "bodytypes",
            },
          },
          {
            $unwind: {
              path: "$bodytypes",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $replaceRoot: { newRoot: "$bodytypes" },
          },
          {
            $group: {
              _id: "$_id",
              name: { $first: "$name" },
              createdAt: { $first: "$createdAt" },
            },
          },
          {
            $sort: { createdAt: -1 },
          },
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
              totalCars: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              listings: { $slice: ["$listings", 10] }, // limit to 10 ✅
              totalCars: 1,
            },
          },
          { $sort: { name: 1 } },
        ],
        allCategories: [
          {
            $lookup: {
              from: "carcategories",
              let: { categoryId: "$car.categoryId" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$isActive", true] },
                  },
                },
                { $project: { name: 1 } },
                {
                  // Bring in all cars that belong to this category
                  $lookup: {
                    from: "rentallistings",
                    let: { catId: "$_id" },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $and: [
                              { $eq: ["$carCategory._id", "$$catId"] },
                              { $eq: ["$status", LISTING_STATUS.APPROVED] },
                            ],
                          },
                        },
                      },
                      { $project: createCarProjection() },
                    ],
                    as: "cars",
                  },
                },
                {
                  $addFields: {
                    totalCars: { $size: "$cars" },
                  },
                },
                { $sort: { name: 1 } },
              ],
              as: "allCategories",
            },
          },

          // Flatten categories
          { $unwind: "$allCategories" },
          { $replaceRoot: { newRoot: "$allCategories" } },

          // ✅ Group by category _id to remove duplicates
          {
            $group: {
              _id: "$_id",
              name: { $first: "$name" },
              cars: { $first: "$cars" },
              totalCars: { $first: "$totalCars" },
            },
          },

          // Optional: sort again
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
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getCatelogListings = async (req, res) => {
  try {
    const options = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      sort: { createdAt: -1 },
    };

    function returnPipeline(filterId, foreignField) {
      return [
        {
          $match: {
            _id: new mongoose.Types.ObjectId(filterId),
            isActive: true,
          },
        },
        {
          $lookup: {
            from: "rentallistings",
            localField: "_id",
            foreignField: foreignField,
            as: "listings",
            pipeline: [
              {
                $match: { status: LISTING_STATUS.APPROVED, isActive: true },
              },
              {
                $lookup: vendorLookup(),
              },
              {
                $unwind: {
                  path: "$vendor",
                  preserveNullAndEmptyArrays: false,
                },
              },
              {
                $match: {
                  "vendor.isActive": true, // ✅ only active vendors
                },
              },

              // Technical Features Lookup
              {
                $lookup: featuresLookup("technicalfeatures"),
              },

              // Other Features Lookup
              {
                $lookup: featuresLookup("otherfeatures"),
              },
              { $project: createCarProjection() },
            ],
          },
        },
        {
          $unwind: "$listings",
        },
        { $replaceRoot: { newRoot: "$listings" } },
      ];
    }

    function returnDefaultPipeline(filter) {
      return [
        {
          $match: {
            isActive: true,
            status: LISTING_STATUS.APPROVED,
            ...(filter || ""),
          },
        },
        {
          $lookup: vendorLookup(),
        },
        {
          $unwind: {
            path: "$vendor",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $match: {
            "vendor.isActive": true, // ✅ only active vendors
          },
        },

        // Technical Features Lookup
        {
          $lookup: featuresLookup("technicalfeatures"),
        },

        // Other Features Lookup
        {
          $lookup: featuresLookup("otherfeatures"),
        },

        { $project: createCarProjection() },
      ];
    }

    let data = null;
    switch (req.params.filterType) {
      case "categories":
        data = await carcategories.aggregatePaginate(
          returnPipeline(req.params.filterId, "carCategory._id"),
          options
        );
        break;
      case "brands":
        data = await CarBrand.aggregatePaginate(
          returnPipeline(req.params.filterId, "carBrand._id"),
          options
        );
        break;
      case "body-types":
        data = await BodyType.aggregatePaginate(
          returnPipeline(req.params.filterId, "bodyType._id"),
          options
        );
        break;
      case "transmissions":
        data = await Transmission.aggregatePaginate(
          returnPipeline(req.params.filterId, "transmission._id"),
          options
        );
        break;
      case "vendor-cars":
        data = await User.aggregatePaginate(
          returnPipeline(req.params.filterId, "vendor"),
          options
        );
        break;
      case "featured":
        data = await RentalListing.aggregatePaginate(
          returnDefaultPipeline({ isFeatured: true }),
          options
        );
        break;
      case "best":
        data = await RentalListing.aggregatePaginate(
          returnDefaultPipeline({ isBest: true }),
          options
        );
        break;
      case "popular":
        data = await RentalListing.aggregatePaginate(
          returnDefaultPipeline({ isPopular: true }),
          options
        );
        break;
      case "top-choice":
        data = await RentalListing.aggregatePaginate(
          returnDefaultPipeline({ isTopChoice: true }),
          options
        );
        break;
      case "all":
        data = await RentalListing.aggregatePaginate(
          returnDefaultPipeline(),
          options
        );
        break;
      default:
        data = await RentalListing.aggregatePaginate(
          returnDefaultPipeline(),
          options
        );
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.log("Frontend Catelog listings error", err);
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getListing = async (req, res) => {
  try {
    const pipeline = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.listingId),
        },
      },
      {
        $lookup: vendorLookup(),
      },
      {
        $unwind: {
          path: "$vendor",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          "vendor.isActive": true, // ✅ only active vendors
        },
      },
      {
        $lookup: featuresLookup("technicalfeatures"),
      },
      {
        $lookup: featuresLookup("otherfeatures"),
      },
      {
        $project: createCarProjection(),
      },
    ];

    const data = await RentalListing.aggregate(pipeline);

    res.status(200).json({ success: false, data: data[0] || null });
  } catch (err) {
    console.log("get listing error", err);
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getfilteredListings = async (req, res) => {
  try {
    let options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sort: { createdAt: -1 },
    };

    const toArray = (val) => (val ? (Array.isArray(val) ? val : [val]) : []);

    let brands = toArray(req.query.brand);
    let bodyTypes = toArray(req.query.bodyType);
    let locations = toArray(req.query.location);
    let transmissions = toArray(req.query.transmission);
    let categories = toArray(req.query.category);
    let priceRange = req.query.priceRange;
    let noDeposit = req.query.noDeposit;
    let startDates = toArray(req.query.startDate);
    let endDates = toArray(req.query.endDate);

    const match = { isActive: true, status: LISTING_STATUS.APPROVED };

    if (brands.length > 0) {
      match["carBrand._id"] = {
        $in: brands.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }

    if (bodyTypes.length > 0) {
      match["bodyType._id"] = {
        $in: bodyTypes.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }

    if (locations.length > 0) {
      match["location"] = {
        $in: locations.map((name) => new RegExp(`^${name}$`, "i")),
      };
    }
    if (transmissions.length > 0) {
      match["transmission._id"] = {
        $in: transmissions.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }
    if (categories.length > 0) {
      match["carCategory._id"] = {
        $in: categories.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }
    if (noDeposit !== undefined) {
      match["depositRequired"] = noDeposit !== "true";
    }

    // if (priceRange !== undefined) {
    //   const [min, max] = priceRange.split("-").map(Number);

    //   match["rentPerDay"] = { $gte: min, $lte: max };
    // }

    if (priceRange !== undefined && priceRange !== "") {
      const [minStr, maxStr] = priceRange.split("-").map((v) => v.trim());
      const min = minStr ? Number(minStr) : null;
      const max = maxStr ? Number(maxStr) : null;

      match["rentPerDay"] = {};

      if (min !== null && !isNaN(min)) {
        match["rentPerDay"]["$gte"] = min;
      }

      if (max !== null && !isNaN(max)) {
        match["rentPerDay"]["$lte"] = max;
      }

      // Clean up if no valid filters were added
      if (Object.keys(match["rentPerDay"]).length === 0) {
        delete match["rentPerDay"];
      }
    }

    const pipeline = [
      {
        $match: match,
      },
      {
        $lookup: vendorLookup(),
      },
      {
        $unwind: {
          path: "$vendor",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $match: {
          "vendor.isActive": true, // ✅ only active vendors
        },
      },
      {
        $lookup: featuresLookup("technicalfeatures"),
      },
      {
        $lookup: featuresLookup("otherfeatures"),
      },
      { $project: createCarProjection() },
    ];

    const data = await RentalListing.aggregatePaginate(pipeline, options);
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.log("getfilteredlisting error", err);
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getSearchedListings = async (req, res) => {
  //need to handle vendor inactive listings
  try {
    const searchTerm = (req.query.search || "").trim();
    if (!searchTerm) {
      return res.status(200).json({ success: true, result: [] });
    }

    // 1️⃣ Try exact / prefix match using B-tree index
    let result = await RentalListing.find({
      title: { $regex: `^${escapeRegex(searchTerm)}`, $options: "i" },
    }).select("title");

    // If exact/prefix match found, return it
    if (result.length > 0) {
      return res.status(200).json({ success: true, result });
    }

    // 2️⃣ If not, try text search (word-based)
    result = await RentalListing.find({
      $text: { $search: searchTerm },
    }).select("title");

    if (result.length > 0) {
      return res.status(200).json({ success: true, result });
    }

    // 3️⃣ Fallback: Fuzzy search with Fuse.js (for typos)
    const allListings = await RentalListing.find().select("title"); // fetch all or a limited subset
    const fuse = new Fuse(allListings, {
      keys: ["title"],
      threshold: 0.3, // adjust for fuzziness
    });

    result = fuse.search(searchTerm).map((r) => r.item);

    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.error("getSearchedListings error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

exports.getFiltersMasterData = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .select("name")
      .sort({
        createdAt: -1,
      });

    const brands = await Brand.find({ isActive: true })
      .select("logo name")
      .sort({ createdAt: -1 });

    const bodyTypes = await BodyType.find({ isActive: true })
      .select("name")
      .sort({
        createdAt: -1,
      });

    res
      .status(200)
      .json({ success: true, data: { categories, brands, bodyTypes } });
  } catch (err) {
    console.log("filtersMasterDataErr", err);
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};
