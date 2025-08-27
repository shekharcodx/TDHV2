const express = require("express");
const router = express.Router();

const {
  getAllListings,
  listingStatus,
  listingIsActive,
} = require("../../controllers/admin/listing.controller");

const {
  listingStatusValidation,
  listingIsActiveValidation,
} = require("../../validations/admin/listing.validation");

const validate = require("../../middlewares/validate.middleware");

router.get("/allListings", getAllListings);

router.put(
  "/listingStatus/:listingId",
  listingStatusValidation,
  validate,
  listingStatus
);

router.patch(
  "/listing/:listingId",
  listingIsActiveValidation,
  validate,
  listingIsActive
);

module.exports = router;
