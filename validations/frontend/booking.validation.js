const { body } = require("express-validator");

exports.bookingValidation = [
  body("listingId").isMongoId().withMessage("Valid listingId is required"),
  body("startDate").isISO8601().withMessage("Valid startDate is required"),
  body("endDate").isISO8601().withMessage("Valid endDate is required"),
];
