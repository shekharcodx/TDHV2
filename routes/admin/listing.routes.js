const express = require("express");
const router = express.Router();

const {
  getAllListings,
  listingStatus,
} = require("../../controllers/admin/listing.controller");

const {
  listingStatusValidation,
} = require("../../validations/admin/listing.validation");

const validate = require("../../middlewares/validate.middleware");

router.get("/allListings", getAllListings);

router.put(
  "/listingStatus/:listingId",
  listingStatusValidation,
  validate,
  listingStatus
);

module.exports = router;
