const express = require("express");
const router = express.Router();
const {
  createBooking,
  calculateBooking,
  getBookings,
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

router.get("/bookings", getBookings);

module.exports = router;
