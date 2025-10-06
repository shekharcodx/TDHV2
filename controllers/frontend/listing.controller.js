const {
  LISTING_STATUS,
  vendorLookup,
  createCarProjection,
  featuresLookup,
} = require("../../config/constants");
const { default: mongoose } = require("mongoose");
const messages = require("../../messages/messages");
const carcategories = require("../../models/carModels/carCategory.model");
const CarBrand = require("../../models/carModels/carBrand.model");
const BodyType = require("../../models/carModels/carBodyType.model");
const Transmission = require("../../models/carModels/carTransmission.model");
const RentalListing = require("../../models/rentalListing.model");
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
            $lookup: {
              from: "carbrands",
              pipeline: [
                { $match: { isActive: true } },
                { $project: { _id: 1, name: 1, logo: 1 } },
                { $sort: { createdAt: -1 } }, // or popularScore if available
                // { $limit: 10 },
              ],
              as: "brands",
            },
          },
          { $unwind: "$brands" },
          { $replaceRoot: { newRoot: "$brands" } },
          { $limit: 20 },
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
                    $expr: {
                      $eq: ["$isActive", true],
                    },
                  },
                },
                { $project: { name: 1 } },
                {
                  // Bring in all cars that belong to this category (reverse join)
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
          {
            $unwind: "$allCategories",
          },
          {
            $replaceRoot: { newRoot: "$allCategories" },
          },
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

    const pipeline = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.filterId),
          isActive: true,
        },
      },
      {
        $lookup: {
          from: "rentallistings",
          localField: "_id",
          foreignField: getForeignCollection(),
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
            { $project: createCarProjection() },
          ],
        },
      },
      {
        $unwind: "$listings",
      },
      { $replaceRoot: { newRoot: "$listings" } },
    ];

    const defaultPipeline = [
      {
        $match: {
          isActive: true,
          status: LISTING_STATUS.APPROVED,
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

    function getForeignCollection() {
      switch (req.params.filterType) {
        case "categories":
          return "carCategory._id";
        case "brands":
          return "carBrand._id";
        case "body-types":
          return "bodyType._id";
        case "transmissions":
          return "transmission._id";
        default:
          return null;
      }
    }

    let data = null;
    switch (req.params.filterType) {
      case "categories":
        data = await carcategories.aggregatePaginate(pipeline, options);
        break;
      case "brands":
        data = await CarBrand.aggregatePaginate(pipeline, options);
        break;
      case "body-types":
        data = await BodyType.aggregatePaginate(pipeline, options);
        break;
      case "transmissions":
        data = await Transmission.aggregatePaginate(pipeline, options);
        break;
      default:
        data = await RentalListing.aggregatePaginate(defaultPipeline, options);
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
        $lookup: featuresLookup("technicalfeatures"),
      },
      {
        $lookup: featuresLookup("otherfeatures"),
      },
      { $project: createCarProjection() },
    ];

    const data = await RentalListing.aggregate(pipeline);

    res.status(200).json({ success: false, data });
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

    const match = {};

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
          preserveNullAndEmptyArrays: true,
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
