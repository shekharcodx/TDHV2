const { param, body } = require("express-validator");

exports.listingStatusValidation = [
  param("listingId")
    .exists()
    .withMessage("listingId is required")
    .isMongoId()
    .withMessage("Invalid listingId"),
  body("status")
    .exists()
    .withMessage("status is required")
    .isInt()
    .withMessage("status must be a number")
    .toInt()
    .isIn([1, 2, 3])
    .withMessage("status can only be 1, 2, or 3"),
];

exports.listingIsActiveValidation = [
  param("listingId")
    .exists()
    .withMessage("listingId is required")
    .isMongoId()
    .withMessage("Invalid listingId"),
  body("isActive")
    .exists()
    .withMessage("isActive is required")
    .isBoolean()
    .withMessage("isActive must be boolean"),
];
