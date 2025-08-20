const { body, query } = require("express-validator");

exports.createAdminValidation = [
  body("name").exists().withMessage("Name is required"),
  body("email")
    .exists()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email"),
  body("password").exists().withMessage("Password is required"),
];

exports.updateIsActiveValidation = [
  body("userId")
    .exists()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid user ID"),
  body("isActive")
    .exists()
    .withMessage("Is Active is required")
    .isBoolean()
    .withMessage("Invalid Is Active"),
];

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

exports.getDocumentsValidate = [
  query("documentKey")
    .exists()
    .withMessage("documentKey is required")
    .isString()
    .withMessage("documentKey must be a string"),
];
