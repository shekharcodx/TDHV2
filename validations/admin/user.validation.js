const { body } = require("express-validator");

exports.updateAccountStatusValidation = [
  body("id")
    .notEmpty()
    .withMessage("ID is required")
    .isMongoId()
    .withMessage("Invalid user ID format"),

  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .toInt()
    .isIn([2, 3, 4])
    .withMessage("Status must be either 2, 3 or 4"),
];

exports.addCountryValidation = [
  body("countryName").trim().notEmpty().withMessage("Country Name is required"),

  body("countryCode").trim().notEmpty().withMessage("Country Code is required"),
];

exports.addStatesValidation = [
  body("stateNames")
    .isArray({ min: 1 })
    .withMessage("State Names must be a non-empty array"),

  body("stateNames.*")
    .isString()
    .notEmpty()
    .withMessage("Each state name must be a non-empty string"),

  body("countryId")
    .notEmpty()
    .withMessage("Country ID is required")
    .isMongoId()
    .withMessage("Invalid Country ID"),
];

exports.addCitiesValidation = [
  body("cityNames")
    .exists()
    .withMessage("City Names are required")
    .isArray({ min: 1 })
    .withMessage("City Names must be a non-empty array"),

  body("cityNames.*")
    .optional()
    .isString()
    .withMessage("Each city name must be a string")
    .notEmpty()
    .withMessage("Each city name must be a non-empty string"),

  body("stateId")
    .exists()
    .withMessage("State ID is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid State ID"),
];
