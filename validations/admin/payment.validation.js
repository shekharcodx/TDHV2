const { param } = require("express-validator");

exports.createOnboardingLinkVal = [
  param("id").isMongoId().withMessage("id is not valid"),
];
