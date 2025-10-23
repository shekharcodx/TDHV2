const { body, param } = require("express-validator");
const { BOOKING_STATUS } = require("../../config/constants");

exports.updateBookingStatusValidations = [
  param("bookingId").isMongoId().withMessage("bookingId is invalid"),
  body("bookingStatus")
    .notEmpty()
    .withMessage("bookingStatus is required")
    .isInt()
    .withMessage("bookingStatus must be a number")
    .toInt()
    .isIn([
      BOOKING_STATUS.PENDING,
      BOOKING_STATUS.CONFIRMED,
      BOOKING_STATUS.CANCELED,
      BOOKING_STATUS.EXPIRED,
    ])
    .withMessage("bookingStatus must be between 1, 2, 3 or 4"),
];
