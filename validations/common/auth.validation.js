const { body, param } = require("express-validator");
const { USER_ROLES } = require("../../config/constants");

exports.registerValidation = [
  // Name
  body("name")
    .notEmpty()
    .withMessage("name is required")
    .isLength({ min: 2 })
    .withMessage("name must be at least 2 characters long"),

  // Email
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .isLowercase()
    .withMessage("email ID must be in lowercase letters"),

  // Role
  body("role")
    .notEmpty()
    .withMessage("role is required")
    .isIn([USER_ROLES.VENDOR, USER_ROLES.CUSTOMER])
    .withMessage("role must be vendor (2) or customer (3)"),

  // Password
  body("password")
    .if(body("role").equals(USER_ROLES.CUSTOMER.toString()))
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters"),

  // Vendor-specific fields
  body("businessName")
    .if(body("role").equals(USER_ROLES.VENDOR.toString()))
    .notEmpty()
    .withMessage("businessName is required for vendors"),

  body("street")
    .if(body("role").equals(USER_ROLES.VENDOR.toString()))
    .notEmpty()
    .withMessage("street address is required for vendors"),

  body("country")
    .if(body("role").equals(USER_ROLES.VENDOR.toString()))
    .notEmpty()
    .withMessage("country is required for vendors"),

  body("city")
    .if(body("role").equals(USER_ROLES.VENDOR.toString()))
    .notEmpty()
    .withMessage("city is required for vendors"),

  body("state")
    .if(body("role").equals(USER_ROLES.VENDOR.toString()))
    .notEmpty()
    .withMessage("state is required for vendors"),

  body("mapUrl")
    .if(body("role").equals(USER_ROLES.VENDOR.toString()))
    .notEmpty()
    .withMessage("mapUrl is required for vendors"),

  body("mobileNum")
    .if(body("role").equals(USER_ROLES.VENDOR.toString()))
    .notEmpty()
    .withMessage("mobileNumber is required for vendors"),

  body("whatsappNum")
    .if(body("role").equals(USER_ROLES.VENDOR.toString()))
    .notEmpty()
    .withMessage("whatsAppNum is required for vendors"),

  body("landlineNum")
    .if(body("role").equals(USER_ROLES.VENDOR.toString()))
    .notEmpty()
    .withMessage("landLineNum is required for vendors"),

  body("fleetSize")
    .if(body("role").equals(USER_ROLES.VENDOR.toString()))
    .isInt({ min: 1 })
    .withMessage("fleetSize must be a positive number"),

  body("ijariCertificate")
    .if(body("role").equals(USER_ROLES.VENDOR.toString()))
    .custom((value, { req }) => {
      // console.log("ijariCertificate", req.files.ijariCertificate);
      if (
        !req.files ||
        !req.files.ijariCertificate ||
        req.files.ijariCertificate.length === 0
      ) {
        throw new Error("ijariCertificate is required");
      }
      return true;
    }),
  body("tradeLicense")
    .if(body("role").equals(USER_ROLES.VENDOR.toString()))
    .custom((value, { req }) => {
      // console.log("tradeLicense", req.files.tradeLicense);
      if (
        !req.files ||
        !req.files.tradeLicense ||
        req.files.tradeLicense.length === 0
      ) {
        throw new Error("tradeLicense is required");
      }
      return true;
    }),
  body("vatCertificate")
    .if(body("role").equals(USER_ROLES.VENDOR.toString()))
    .custom((value, { req }) => {
      // console.log("vatCertificate", req.files.vatCertificate);
      if (
        !req.files ||
        !req.files.vatCertificate ||
        req.files.vatCertificate.length === 0
      ) {
        throw new Error("vatCertificate is required");
      }
      return true;
    }),
  body("noc")
    .if(body("role").equals(USER_ROLES.VENDOR.toString()))
    .custom((value, { req }) => {
      // console.log("noc", req.files.noc);
      if (!req.files || !req.files.noc || req.files.noc.length === 0) {
        throw new Error("noc is required");
      }
      return true;
    }),
  body("emiratesId")
    .if(body("role").equals(USER_ROLES.VENDOR.toString()))
    .custom((value, { req }) => {
      // console.log("emiratesId", req.files.emiratesId);
      if (
        !req.files ||
        !req.files.emiratesId ||
        req.files.emiratesId.length === 0
      ) {
        throw new Error("emiratesId is required");
      }
      return true;
    }),
  body("poa")
    .if(body("role").equals(USER_ROLES.VENDOR.toString()))
    .custom((value, { req }) => {
      // console.log("poa", req.files.poa);
      if (!req.files || !req.files.poa || req.files.poa.length === 0) {
        throw new Error("poa is required");
      }
      return true;
    }),
];

exports.updateProfileValidation = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("name is required")
    .isLength({ min: 2 })
    .withMessage("name must be at least 2 characters"),

  body("email").custom((value) => {
    if (value) {
      throw new Error("email cannot be updated");
    }
    return true;
  }),

  body("password")
    .optional()
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters"),

  body("role").optional().notEmpty().withMessage("role is required"),
];

exports.loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("email must be valid"),

  body("password").notEmpty().withMessage("password is required"),
];

exports.changePasswordValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("email must be valid"),
  body("oldPassword").notEmpty().withMessage("oldPassword is required"),
  body("newPassword")
    .notEmpty()
    .withMessage("newPassword is required")
    .isLength({ min: 6 })
    .withMessage("newPassword must be at least 6 characters"),
];

exports.forgetPasswordValidation = [
  body("email")
    .exists()
    .withMessage("email is required")
    .isEmail()
    .withMessage("email must be valid"),
];

exports.resetPasswordValidation = [
  body("token")
    .exists()
    .withMessage("token is required")
    .isString()
    .withMessage("token must be a string"),
  body("newPassword")
    .exists()
    .withMessage("newPassword is required")
    .isLength({ min: 6 })
    .withMessage("newPassword must be at least 6 characters"),
];
