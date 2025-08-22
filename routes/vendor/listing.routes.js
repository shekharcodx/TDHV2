const express = require("express");
const router = express.Router();
const {
  createListing,
  getListings,
} = require("../../controllers/vendor/listing.controller");
const {
  rentalListingValidator,
} = require("../../validations/vendor/listing.validation");

const upload = require("../../middlewares/upload.middleware");
const validate = require("../../middlewares/validate.middleware");

router.post(
  "/createListing",
  upload.array("images"),
  rentalListingValidator,
  validate,
  createListing
);

router.get("/getVendorListings", getListings);

module.exports = router;
