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

exports.editVendorProfileValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters long"),

  // Email
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .isLowercase()
    .withMessage("Email ID must be in lowercase letters"),

  // Role
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn([2])
    .withMessage("Role must be vendor (2) or customer (3)"),

  // Password
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  // Vendor-specific fields
  body("businessName")
    .exists()
    .withMessage("Business name is required for vendors"),

  body("address.street")
    .exists()
    .withMessage("Street address is required for vendors"),

  body("address.country")
    .exists()
    .withMessage("Country is required for vendors"),

  body("address.city").exists().withMessage("City is required for vendors"),

  body("contact.mobileNum")
    .exists()
    .withMessage("Mobile number is required for vendors"),

  body("contact.whatsappNum")
    .exists()
    .withMessage("WhatsApp number is required for vendors"),

  body("contact.landlineNum")
    .exists()
    .withMessage("LandLine number is required for vendors"),

  body("vendorInformation.fleetSize")
    .isInt({ min: 1 })
    .withMessage("Fleet size must be a positive number"),
];
