const { body } = require("express-validator");

exports.editVendorProfileValidation = [
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

  body("street").notEmpty().withMessage("street is required for vendors"),

  body("country").notEmpty().withMessage("country is required for vendors"),

  body("city").notEmpty().withMessage("city is required for vendors"),

  body("state").notEmpty().withMessage("state is required for vendors"),

  body("mapUrl").notEmpty().withMessage("mapUrl is required for vendors"),

  body("mobileNum").notEmpty().withMessage("mobileNum is required for vendors"),

  body("whatsappNum")
    .notEmpty()
    .withMessage("whatsappNum is required for vendors"),

  body("landlineNum")
    .notEmpty()
    .withMessage("landlineNum is required for vendors"),

  body("fleetSize")
    .optional()
    .isInt({ min: 1 })
    .withMessage("fleetSize must be a positive number"),
];
