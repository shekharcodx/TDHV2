const express = require("express");
const router = express.Router();

const {
  rentalPayment,
  depositPayment,
} = require("../../controllers/stripe/payment.controller");
const {
  paymentValidation,
} = require("../../validations/stripe/payment.validation");
const validate = require("../../middlewares/validate.middleware");

router.get(
  "/payments/rental/:bookingId",
  paymentValidation,
  validate,
  rentalPayment
);

router.get(
  "/payments/deposit/:bookingId",
  paymentValidation,
  validate,
  depositPayment
);

module.exports = router;
