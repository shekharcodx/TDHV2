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

router.post("/country", addCountryValidation, validate, addCountry);

router.post("/states", addStatesValidation, validate, addStates);

router.post("/cities", addCitiesValidation, validate, addCities);

router.delete(
  "/country/:countryId",
  deleteCountryValidation,
  validate,
  deleteCountry
);

router.delete("/state/:stateId", deleteStateValidation, validate, deleteState);

router.delete("/city/:cityId", deleteCityValidation, validate, deleteCity);

module.exports = router;
