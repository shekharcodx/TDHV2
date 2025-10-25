const express = require("express");
const router = express.Router();

const {
  stripeWebhook,
} = require("../../controllers/stripe/webhook.controller");

router.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

module.exports = router;
