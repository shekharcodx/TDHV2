const express = require("express");
const router = express.Router();

const { getListing } = require("../../controllers/common/listing.controller");
const {
  getListingValidation,
} = require("../../validations/common/listing.validation");

const validate = require("../../middlewares/validate.middleware");

router.get("/listing/:listingId", getListingValidation, validate, getListing);

module.exports = router;
