const { param } = require("express-validator");

exports.getCarModelsValidation = [
  param("carBrandId")
    .exists()
    .withMessage("carBrandId is required")
    .isMongoId()
    .withMessage("Invalid carBrandId"),
];

exports.getCarTrimsValidation = [
  param("carModelId")
    .exists()
    .withMessage("carModelId is required")
    .isMongoId()
    .withMessage("Invalid carModelId"),
];
