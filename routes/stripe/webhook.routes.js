const express = require("express");
const router = express.Router();

const {
  stripeWebhook,
} = require("../../controllers/stripe/webhook.controller");

router.post("/", stripeWebhook);

module.exports = router;
