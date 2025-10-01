const { param } = require("express-validator");

exports.getCatelogListingsValidation = [
  param("filterType")
    .notEmpty()
    .withMessage("filterType is required")
    .isString()
    .withMessage("filterType must be a string")
    .isIn(["categories", "body-types", "transmissions", "brands"])
    .withMessage(
      "filterType must be between categories, body-types, transmissions or brands"
    ),
  param("filterId")
    .notEmpty()
    .withMessage("filterId is required")
    .isMongoId()
    .withMessage("filterId is invalid"),
];

exports.getListingValidation = [
  param("listingId")
    .notEmpty()
    .withMessage("listingId is required")
    .isMongoId()
    .withMessage("listingId is invalid"),
];
