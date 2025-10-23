const express = require("express");
const router = express.Router();
const {
  createOnboardingLink,
} = require("../../controllers/admin/payment.controller");
const {
  createOnboardingLinkVal,
} = require("../../validations/admin/payment.validation");
const validate = require("../../middlewares/validate.middleware");

router.post(
  "/vendor-onboarding/:id",
  createOnboardingLinkVal,
  validate,
  createOnboardingLink
);

module.exports = router;
