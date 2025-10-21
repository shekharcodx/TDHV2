const express = require("express");
const router = express.Router();
const {
  completeProfile,
  editProfile,
  updateProfile,
} = require("../../controllers/frontend/profile.controller");
const {
  completeProfileValidation,
  updateProfileValidation,
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

router.get("/user-profile/edit", editProfile);

router.patch(
  "/user-profile/update",
  updateProfileValidation,
  validate,
  updateProfile
);

module.exports = router;
