const express = require("express");
const router = express.Router();
const {
  updateAccountStatus,
  getAllVendors,
  getPendingVendors,
  getAllCustomers,
  addCountry,
  addStates,
  addCities,
} = require("../../controllers/admin/user.controller");
const {
  updateAccountStatusValidation: accountStatusValidate,
  addCountryValidation,
  addStatesValidation,
  addCitiesValidation,
} = require("../../validations/admin/user.validation");

const validate = require("../../middlewares/validate.middleware");

router.put(
  "/updateAccountStatus",
  accountStatusValidate,
  validate,
  updateAccountStatus
);

router.get("/getAllVendors", getAllVendors);

router.get("/getPendingVendors", getPendingVendors);

router.get("/getAllCustomers", getAllCustomers);

router.post("/addCountry", addCountryValidation, validate, addCountry);

router.post("/addStates", addStatesValidation, validate, addStates);

router.post("/addCities", addCitiesValidation, validate, addCities);

module.exports = router;
