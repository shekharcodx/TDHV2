const express = require("express");
const router = express.Router();
const {
  getCountriesData,
  getCountries,
  getStates,
  getCities,
  createListing,
} = require("../../controllers/vendor/listing.controller");
const {
  getStatesValidation,
  getCitiesValidation,
  rentalListingValidator,
} = require("../../validations/vendor/listing.validation");

const upload = require("../../middlewares/upload.middleware");
const validate = require("../../middlewares/validate.middleware");

router.get("/getCountriesData", getCountriesData);

router.get("/getCountries", getCountries);

router.get("/getStates/:countryId", getStatesValidation, validate, getStates);

router.get("/getCities/:stateId", getCitiesValidation, validate, getCities);

router.post(
  "/createListing",
  upload.any("images"),
  rentalListingValidator,
  validate,
  createListing
);

module.exports = router;
