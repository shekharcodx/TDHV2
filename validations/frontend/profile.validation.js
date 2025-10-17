const { body } = require("express-validator");
const { USER_ROLES } = require("../../config/constants");

exports.completeProfileValidation = [
  body("emiratesIdFront")
    .if(body("role").equals(USER_ROLES.CUSTOMER.toString()))
    .custom((value, { req }) => {
      // console.log("emiratesId", req.files.emiratesId);
      if (
        !req.files ||
        !req.files.emiratesIdFront ||
        req.files.emiratesIdFront.length === 0
      ) {
        throw new Error("emiratesIdFront is required");
      }
      return true;
    }),

  body("emiratesIdBack")
    .if(body("role").equals(USER_ROLES.CUSTOMER.toString()))
    .custom((value, { req }) => {
      // console.log("emiratesId", req.files.emiratesId);
      if (
        !req.files ||
        !req.files.emiratesIdBack ||
        req.files.emiratesIdBack.length === 0
      ) {
        throw new Error("emiratesIdBack is required");
      }
      return true;
    }),

  body("drivingLicenseFront")
    .if(body("role").equals(USER_ROLES.CUSTOMER.toString()))
    .custom((value, { req }) => {
      // console.log("emiratesId", req.files.emiratesId);
      if (
        !req.files ||
        !req.files.drivingLicenseFront ||
        req.files.drivingLicenseFront.length === 0
      ) {
        throw new Error("drivingLicenseFront is required");
      }
      return true;
    }),

  body("drivingLicenseBack")
    .if(body("role").equals(USER_ROLES.CUSTOMER.toString()))
    .custom((value, { req }) => {
      // console.log("emiratesId", req.files.emiratesId);
      if (
        !req.files ||
        !req.files.drivingLicenseBack ||
        req.files.drivingLicenseBack.length === 0
      ) {
        throw new Error("drivingLicenseBack is required");
      }
      return true;
    }),

  body("passport")
    .if(body("role").equals(USER_ROLES.CUSTOMER.toString()))
    .custom((value, { req }) => {
      // console.log("emiratesId", req.files.emiratesId);
      if (
        !req.files ||
        !req.files.passport ||
        req.files.passport.length === 0
      ) {
        throw new Error("passport is required");
      }
      return true;
    }),

  body("visa")
    .if(body("role").equals(USER_ROLES.CUSTOMER.toString()))
    .custom((value, { req }) => {
      // console.log("emiratesId", req.files.emiratesId);
      if (
        !req.files ||
        !req.files.visaCopy ||
        req.files.visaCopy.length === 0
      ) {
        throw new Error("visaCopy is required");
      }
      return true;
    }),
];
