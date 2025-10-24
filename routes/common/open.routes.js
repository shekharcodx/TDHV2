const express = require("express");
const {
  redirectToOnboarding,
} = require("../../controllers/admin/payment.controller");
const router = express.Router();

router.get("/redirect/stripe-onboard/:accountId/:code", redirectToOnboarding);

module.exports = router;
