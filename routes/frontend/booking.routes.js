const express = require("express");
const router = express.Router();
const {
  createBooking,
  calculateBooking,
} = require("../../controllers/frontend/booking.controller");
const {
  bookingValidation,
} = require("../../validations/frontend/booking.validation");
const validate = require("../../middlewares/validate.middleware");

router.post("/booking/create", bookingValidation, validate, createBooking);

router.post(
  "/booking/calculation",
  bookingValidation,
  validate,
  calculateBooking
);

module.exports = router;
