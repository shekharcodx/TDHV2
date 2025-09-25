bestCars: [
  { $match: { bestCars: true } },

  // Existing projections and lookups here...

  {
    $lookup: {
      from: "wishlists",
      let: { listingId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$listingId", "$$listingId"] },
                { $eq: ["$userId", ObjectId(userId)] }
              ]
            }
          }
        },
        { $project: { _id: 1 } }
      ],
      as: "wishlistEntry"
    }
  },
  {
    $addFields: {
      inWishlist: { $gt: [{ $size: "$wishlistEntry" }, 0] }
    }
  },

  { $project: { ...createCarProjection(), inWishlist: 1 } },
  { $limit: 10 }
],