const { body, param } = require("express-validator");

exports.addCarBrandValidation = [
  body("name").exists().withMessage("Name is required"),
  body("logo").custom((value, { req }) => {
    if (!req.file) throw new Error("File is required");
    return true;
  }),
];

exports.addCarModelsValidation = [
  body("brandId")
    .exists()
    .withMessage("Brand id is required")
    .isMongoId()
    .withMessage("Invalid brand id"),
  body("names")
    .exists()
    .withMessage("Name is required")
    .isArray()
    .withMessage("Name must be an array"),

  body("names.*")
    .isString()
    .withMessage("Each name must be a string")
    .notEmpty()
    .withMessage("Name cannot be empty"),
];

exports.addCarTrimsValidation = [
  body("modelId")
    .exists()
    .withMessage("Model id is required")
    .isMongoId()
    .withMessage("Invalid model id"),
  body("names")
    .exists()
    .withMessage("Name is required")
    .isArray()
    .withMessage("Name must be an array"),

  body("names.*")
    .isString()
    .withMessage("Each name must be a string")
    .notEmpty()
    .withMessage("Name cannot be empty"),
];

exports.addCarBodyTypesValidation = [
  body("names")
    .exists()
    .withMessage("Name is required")
    .isArray()
    .withMessage("Name must be an array"),

  body("names.*")
    .isString()
    .withMessage("Each name must be a string")
    .notEmpty()
    .withMessage("Name cannot be empty"),
];

exports.addYearsValidation = [
  body("years")
    .exists()
    .withMessage("Year is required")
    .isArray()
    .withMessage("Year must be an array"),
  body("years.*")
    .isString()
    .withMessage("Each name must be a string")
    .notEmpty()
    .withMessage("Name cannot be empty"),
];

exports.getCarModelsValidation = [
  param("carBrandId")
    .exists()
    .withMessage("Car brand id is required")
    .isMongoId()
    .withMessage("Invalid car brand id"),
];

exports.getCarTrimsValidation = [
  param("carModelId")
    .exists()
    .withMessage("Car model id is required")
    .isMongoId()
    .withMessage("Invalid car model id"),
];

exports.deleteCarBrandValidation = [
  param("brandId")
    .exists()
    .withMessage("Car brand id is required")
    .isMongoId()
    .withMessage("Invalid car brand id"),
];

exports.deleteCarModelValidation = [
  param("modelId")
    .exists()
    .withMessage("Car model id is required")
    .isMongoId()
    .withMessage("Invalid car model id"),
];

exports.deleteCarTrimValidation = [
  param("trimId")
    .exists()
    .withMessage("Car trim id is required")
    .isMongoId()
    .withMessage("Invalid car trim id"),
];

exports.deleteYearValidation = [
  param("yearId")
    .exists()
    .withMessage("Year id is required")
    .isMongoId()
    .withMessage("Invalid year id"),
];
