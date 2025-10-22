const { body } = require("express-validator");

exports.bookingValidation = [
  body("carId").isMongoId().withMessage("Valid carId is required"),
  body("address").optional().isString().withMessage("address must be a string"),
  body("pickupDate")
    .notEmpty()
    .withMessage("pickupDate is required")
    .isISO8601()
    .withMessage("Valid pickupDate is required"),
  body("pickupTime")
    .notEmpty()
    .withMessage("Pickup time is required")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Pickup time must be in 24-hour format (HH:mm)"),
  body("dropoffDate")
    .notEmpty()
    .withMessage("dropoffDate is required")
    .isISO8601()
    .withMessage("Valid dropoffDate is required"),
  body("dropoffTime")
    .notEmpty()
    .withMessage("Dropoff time is required")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Dropoff time must be in 24-hour format (HH:mm)"),
  body("priceType").notEmpty().withMessage("priceType is required"),
  body("deliveryRequired")
    .notEmpty()
    .withMessage("deliveryRequired is required")
    .isBoolean()
    .withMessage("deliveryRequired must be a boolean")
    .toBoolean(),
];
