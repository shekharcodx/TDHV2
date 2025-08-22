const { body, query, param } = require("express-validator");

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

exports.editVendorProfileValidation = [
  body("vendorId")
    .exists()
    .withMessage("vendorId is required")
    .isMongoId()
    .withMessage("vendorId is invalid"),
  body("name")
    .notEmpty()
    .withMessage("name is required")
    .isString()
    .withMessage("name must be a string"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .isLowercase()
    .withMessage("Email ID must be in lowercase letters"),

  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("businessName")
    .notEmpty()
    .withMessage("businessName is required for vendors"),

  body("address.street")
    .notEmpty()
    .withMessage("street is required for vendors"),

  body("address.country")
    .notEmpty()
    .withMessage("country is required for vendors"),

  body("address.city").notEmpty().withMessage("city is required for vendors"),

  body("contact.mobileNum")
    .notEmpty()
    .withMessage("Mobile number is required for vendors"),

  body("contact.whatsappNum")
    .notEmpty()
    .withMessage("WhatsApp number is required for vendors"),

  body("contact.landlineNum")
    .notEmpty()
    .withMessage("LandLine number is required for vendors"),

  body("vendorInformation.fleetSize")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Fleet size must be a positive number"),
];

exports.getUserValidation = [
  param("userId")
    .exists()
    .withMessage("userId is required")
    .isMongoId()
    .withMessage("userId is invalid"),
];

exports.editCurrentAdminProfileValidate = [
  body("name")
    .notEmpty()
    .withMessage("name is required")
    .isString()
    .withMessage("name must be a string"),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];
