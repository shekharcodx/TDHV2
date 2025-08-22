const express = require("express");
const router = express.Router();
const {
  getCountriesData,
  getCountries,
  getStates,
  getCities,
} = require("../../controllers/vendor/listing.controller");

const {
  getStatesValidation,
  getCitiesValidation,
} = require("../../validations/vendor/listing.validation");

const validate = require("../../middlewares/validate.middleware");

router.get("/getCountriesData", getCountriesData);

router.get("/getCountries", getCountries);

router.get("/getStates/:countryId", getStatesValidation, validate, getStates);

router.get("/getCities/:stateId", getCitiesValidation, validate, getCities);

module.exports = router;
