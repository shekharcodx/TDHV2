const { body, query, param } = require("express-validator");

exports.createAdminValidation = [
  body("name").exists().withMessage("name is required"),
  body("email")
    .exists()
    .withMessage("email is required")
    .isEmail()
    .withMessage("Invalid email"),
  body("password").exists().withMessage("password is required"),
];

exports.updateIsActiveValidation = [
  body("userId")
    .exists()
    .withMessage("userId is required")
    .isMongoId()
    .withMessage("Invalid userId"),
  body("isActive")
    .exists()
    .withMessage("isActive is required")
    .isBoolean()
    .withMessage("Invalid isActive"),
];

exports.updateAccountStatusValidation = [
  body("id")
    .notEmpty()
    .withMessage("id is required")
    .isMongoId()
    .withMessage("Invalid user id format"),

  body("status")
    .notEmpty()
    .withMessage("status is required")
    .toInt()
    .isIn([2, 3, 4])
    .withMessage("status must be either 2, 3 or 4"),
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
    .withMessage("email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .isLowercase()
    .withMessage("email ID must be in lowercase letters"),

  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters"),

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
    .withMessage("mobileNumber is required for vendors"),

  body("contact.whatsappNum")
    .notEmpty()
    .withMessage("whatsappNumber is required for vendors"),

  body("contact.landlineNum")
    .notEmpty()
    .withMessage("landLineNumber is required for vendors"),

  body("vendorInformation.fleetSize")
    .optional()
    .isInt({ min: 1 })
    .withMessage("fleetSize must be a positive number"),
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
    .withMessage("password must be at least 6 characters"),
];
