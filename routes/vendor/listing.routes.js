const express = require("express");
const router = express.Router();
const {
  createListing,
  getListings,
  listingIsActive,
  updateListing,
} = require("../../controllers/vendor/listing.controller");
const {
  rentalListingValidator,
  listingIsActiveValidation,
  updateListingValidation,
} = require("../../validations/vendor/listing.validation");

const upload = require("../../middlewares/upload.middleware");
const validate = require("../../middlewares/validate.middleware");

router.post(
  "/listing",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  rentalListingValidator,
  validate,
  createListing
);

router.get("/vendorListings", getListings);

router.patch(
  "/vendorListing/:listingId",
  listingIsActiveValidation,
  validate,
  listingIsActive
);

router.put(
  "/vendorListing/:listingId",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  updateListingValidation,
  validate,
  updateListing
);

module.exports = router;
