const { param } = require("express-validator");

exports.getCatelogListingsValidation = [
  param("filterType")
    .notEmpty()
    .withMessage("filterType is required")
    .isString()
    .withMessage("filterType must be a string")
    .isIn([
      "categories",
      "body-types",
      "transmissions",
      "brands",
      "featured",
      "best",
      "popular",
      "top-choice",
      "all",
    ])
    .withMessage(
      "filterType must be between categories, body-types, transmissions, brands, best, popular, top-choice or featured"
    ),
  param("filterId")
    .optional()
    .notEmpty()
    .withMessage("filterId is required")
    .isString()
    .withMessage("filterId must be a string"),
];

exports.getListingValidation = [
  param("listingId")
    .notEmpty()
    .withMessage("listingId is required")
    .isMongoId()
    .withMessage("listingId is invalid"),
];
