const express = require("express");
const router = express.Router();

const {
  editVendorProfileValidation,
} = require("../../validations/vendor/user.validation");

const {
  editVendorProfile,
} = require("../../controllers/vendor/user.controller");

const validate = require("../../middlewares/validate.middleware");

const cUpload = require("../../middlewares/registerFiles.middleware");

router.put(
  "/vendorProfile",
  cUpload,
  editVendorProfileValidation,
  validate,
  editVendorProfile
);

module.exports = router;
