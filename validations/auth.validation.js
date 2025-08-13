const { body } = require("express-validator");
const { USER_ROLES } = require("../utils/constants");

exports.registerValidation = [
  // Name
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
    .isIn([USER_ROLES.VENDOR, USER_ROLES.CUSTOMER])
    .withMessage("Role must be vendor (2) or customer (3)"),

  // Password
  body("password")
    .if(body("role").equals(USER_ROLES.CUSTOMER.toString()))
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  // Vendor-specific fields
  body("businessName")
    .if(body("role").equals(USER_ROLES.VENDOR.toString()))
    .notEmpty()
    .withMessage("Business name is required for vendors"),

  body("address.street")
    .if(body("role").equals(USER_ROLES.VENDOR.toString()))
    .notEmpty()
    .withMessage("Street address is required for vendors"),

  body("address.country")
    .if(body("role").equals(USER_ROLES.VENDOR.toString()))
    .notEmpty()
    .withMessage("Country is required for vendors"),

  body("address.city")
    .if(body("role").equals(USER_ROLES.VENDOR.toString()))
    .notEmpty()
    .withMessage("City is required for vendors"),

  body("contact.mobileNum")
    .if(body("role").equals(USER_ROLES.VENDOR.toString()))
    .notEmpty()
    .withMessage("Mobile number is required for vendors"),

  body("contact.whatsappNum")
    .if(body("role").equals(USER_ROLES.VENDOR.toString()))
    .notEmpty()
    .withMessage("WhatsApp number is required for vendors"),

  body("contact.landlineNum")
    .if(body("role").equals(USER_ROLES.VENDOR.toString()))
    .notEmpty()
    .withMessage("LandLine number is required for vendors"),

  body("vendorInformation.fleetSize")
    .if(body("role").equals(USER_ROLES.VENDOR.toString()))
    .isInt({ min: 1 })
    .withMessage("Fleet size must be a positive number"),
];

exports.updateProfileValidation = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),

  body("email").custom((value) => {
    if (value) {
      throw new Error("Email cannot be updated");
    }
    return true;
  }),

  body("password")
    .optional()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("role").optional().notEmpty().withMessage("Role is required"),
];

exports.loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be valid"),

  body("password").notEmpty().withMessage("Password is required"),
];

exports.changePasswordValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be valid"),
  body("oldPassword").notEmpty().withMessage("Old password is required"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
];
