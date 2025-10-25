const { param } = require("express-validator");

exports.paymentValidation = [
  param("bookingId").isMongoId().withMessage("bookingId is invalid"),
];
