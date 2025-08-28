const express = require("express");
const router = express.Router();
const {
  createBooking,
} = require("../../controllers/customer/booking.controller");
const {
  bookingValidation,
} = require("../../validations/customer/booking.validation");
const validate = require("../../middlewares/validate.middleware");

router.post("/booking", bookingValidation, validate, createBooking);

module.exports = router;
