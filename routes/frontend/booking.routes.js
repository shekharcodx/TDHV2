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

router.post("/booking", bookingValidation, validate, createBooking);

router.post("/booking/calculation", calculateBooking);

module.exports = router;
