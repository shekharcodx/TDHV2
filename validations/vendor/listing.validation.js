const { param } = require("express-validator");

exports.getStatesValidation = [
  param("countryId")
    .exists()
    .withMessage("Country ID is required")
    .isMongoId()
    .withMessage("Invalid Country ID"),
];

exports.getCitiesValidation = [
  param("stateId")
    .exists()
    .withMessage("State ID is required")
    .isMongoId()
    .withMessage("Invalid State ID"),
];
