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

router.get("/countriesData", getCountriesData);

router.get("/countries", getCountries);

router.get("/states/:countryId", getStatesValidation, validate, getStates);

router.get("/cities/:stateId", getCitiesValidation, validate, getCities);

module.exports = router;
