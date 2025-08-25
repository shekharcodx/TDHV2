const { param } = require("express-validator");

exports.getListingValidation = [
  param("listingId")
    .exists()
    .withMessage("listingId is required")
    .isMongoId()
    .withMessage("listingId is not valid"),
];
