const express = require("express");
const router = express.Router();
const {
  completeProfile,
} = require("../../controllers/frontend/profile.controller");
const {
  completeProfileValidation,
} = require("../../validations/frontend/profile.validation");
const validate = require("../../middlewares/validate.middleware");
const customerUpload = require("../../middlewares/customerUpload.middleware");

router.post(
  "/complete-profile",
  customerUpload,
  completeProfileValidation,
  validate,
  completeProfile
);

module.exports = router;
