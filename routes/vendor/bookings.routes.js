const express = require("express");
const router = express.Router();

const {
  getAllBookings,
  updateBookingStatus,
} = require("../../controllers/vendor/booking.controller");

const {
  updateBookingStatusValidations,
} = require("../../validations/vendor/booking.validation");

const validate = require("../../middlewares/validate.middleware");

router.get("/vendor-bookings", getAllBookings);

router.patch(
  "/vendor-booking/status/:bookingId",
  updateBookingStatusValidations,
  validate,
  updateBookingStatus
);

module.exports = router;
