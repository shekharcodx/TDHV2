const express = require("express");
const router = express.Router();

const {
  addCountryValidation,
  addStatesValidation,
  addCitiesValidation,
  deleteCountryValidation,
  deleteStateValidation,
  deleteCityValidation,
} = require("../../validations/admin/location.validation");

const {
  addCountry,
  addStates,
  addCities,
  deleteCountry,
  deleteState,
  deleteCity,
} = require("../../controllers/admin/locations.controller");

const validate = require("../../middlewares/validate.middleware");

router.post("/addCountry", addCountryValidation, validate, addCountry);

router.post("/addStates", addStatesValidation, validate, addStates);

router.post("/addCities", addCitiesValidation, validate, addCities);

router.delete(
  "/deleteCountry/:countryId",
  deleteCountryValidation,
  validate,
  deleteCountry
);

router.delete(
  "/deleteState/:stateId",
  deleteStateValidation,
  validate,
  deleteState
);

router.delete(
  "/deleteCity/:cityId",
  deleteCityValidation,
  validate,
  deleteCity
);

module.exports = router;
