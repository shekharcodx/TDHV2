const { body } = require("express-validator");

exports.editVendorProfileValidation = [
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
