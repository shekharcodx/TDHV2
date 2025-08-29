const { body, param } = require("express-validator");

exports.addCountryValidation = [
  body("countryName").trim().notEmpty().withMessage("countryName is required"),

  body("countryCode").trim().notEmpty().withMessage("countryCode is required"),
];

exports.addStatesValidation = [
  body("stateNames")
    .isArray({ min: 1 })
    .withMessage("stateNames must be a non-empty array"),

  body("stateNames.*")
    .isString()
    .notEmpty()
    .withMessage("Each state name must be a non-empty string"),

  body("countryId")
    .notEmpty()
    .withMessage("countryId is required")
    .isMongoId()
    .withMessage("Invalid countryId"),
];

exports.addCitiesValidation = [
  body("cityNames")
    .exists()
    .withMessage("cityNames are required")
    .isArray({ min: 1 })
    .withMessage("cityNames must be a non-empty array"),

  body("cityNames.*")
    .optional()
    .isString()
    .withMessage("Each city name must be a string")
    .notEmpty()
    .withMessage("Each city name must be a non-empty string"),

  body("stateId")
    .exists()
    .withMessage("stateId is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid stateId"),
];

exports.deleteCountryValidation = [
  param("countryId")
    .exists()
    .withMessage("Country ID is required")
    .isMongoId()
    .withMessage("Invalid Country ID"),
];

exports.deleteStateValidation = [
  param("stateId")
    .exists()
    .withMessage("stateId is required")
    .isMongoId()
    .withMessage("Invalid stateId"),
];

exports.deleteCityValidation = [
  param("cityId")
    .exists()
    .withMessage("cityId is required")
    .isMongoId()
    .withMessage("Invalid cityId"),
];
