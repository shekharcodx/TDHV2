const { body, param } = require("express-validator");

exports.addCarBrandValidation = [
  body("name").exists().withMessage("Name is required"),
  body("logo").custom((value, { req }) => {
    if (!req.file) throw new Error("logo is required");
    return true;
  }),
];

exports.addCarModelsValidation = [
  body("brandId")
    .exists()
    .withMessage("brandId is required")
    .isMongoId()
    .withMessage("Invalid brandId"),
  body("names")
    .exists()
    .withMessage("name is required")
    .isArray()
    .withMessage("name must be an array"),

  body("names.*")
    .isString()
    .withMessage("Each name must be a string")
    .notEmpty()
    .withMessage("name cannot be empty"),
];

exports.addCarTrimsValidation = [
  body("modelId")
    .exists()
    .withMessage("modelId is required")
    .isMongoId()
    .withMessage("Invalid modelId"),
  body("names")
    .exists()
    .withMessage("name is required")
    .isArray()
    .withMessage("name must be an array"),

  body("names.*")
    .isString()
    .withMessage("Each name must be a string")
    .notEmpty()
    .withMessage("name cannot be empty"),
];

exports.addCarCategoriesValidation = [
  body("names")
    .exists()
    .withMessage("name is required")
    .isArray()
    .withMessage("name must be an array"),

  body("names.*")
    .isString()
    .withMessage("Each name must be a string")
    .notEmpty()
    .withMessage("name cannot be empty"),
];

exports.addCarBodyTypesValidation = [
  body("names")
    .exists()
    .withMessage("name is required")
    .isArray()
    .withMessage("name must be an array"),

  body("names.*")
    .isString()
    .withMessage("Each name must be a string")
    .notEmpty()
    .withMessage("name cannot be empty"),
];

exports.addYearsValidation = [
  body("years")
    .exists()
    .withMessage("years is required")
    .isArray()
    .withMessage("years must be an array"),
  body("years.*")
    .isString()
    .withMessage("Each year must be a string")
    .notEmpty()
    .withMessage("year cannot be empty"),
];

exports.addCarRegionalSpecsValidation = [
  body("specs")
    .exists()
    .withMessage("specs is required")
    .isArray()
    .withMessage("specs must be an array"),

  body("specs.*")
    .isString()
    .withMessage("Each spec must be a string")
    .notEmpty()
    .withMessage("spec cannot be empty"),
];

exports.addCarHorsePowersValidate = [
  body("horsePowers")
    .exists()
    .withMessage("horsePowers is required")
    .isArray()
    .withMessage("horsePowers must be an array"),

  body("horsePowers.*")
    .exists()
    .withMessage("horsePower array cannot be empty")
    .isInt({ min: 10, max: 2000 })
    .withMessage("horsePower must be a number between 10 and 2000")
    .toInt(),
];

exports.addCarSeatingCapacityValidate = [
  body("seatingCapacities")
    .exists()
    .withMessage("seatingCapacities is required")
    .isArray()
    .withMessage("seatingCapacities must be an array"),

  body("seatingCapacities.*")
    .exists()
    .withMessage("seatingCapacities array cannot be empty")
    .isInt({ min: 2, max: 11 })
    .withMessage("seatingCapacities must be a number between 2 and 11")
    .toInt(),
];

exports.addCarColorsValidate = [
  body("colors")
    .exists()
    .withMessage("colors is required")
    .isArray()
    .withMessage("colors must be an array"),

  body("colors.*")
    .exists()
    .withMessage("colors array cannot be empty")
    .isString()
    .withMessage("color must be a string"),
];

exports.addCarTechFeaturesValidate = [
  body("features")
    .exists()
    .withMessage("features is required")
    .isArray()
    .withMessage("features must be an array"),

  body("features.*")
    .exists()
    .withMessage("features array cannot be empty")
    .isString()
    .withMessage("feature must be a string"),
];

exports.addCarFuelTypesValidation = [
  body("fuelTypes")
    .exists()
    .withMessage("fuelTypes is required")
    .isArray()
    .withMessage("fuelTypes must be an array"),

  body("fuelTypes.*")
    .exists()
    .withMessage("fuelTypes array cannot be empty")
    .isString()
    .withMessage("fuelTypes must be a string"),
];

exports.addCarDoorsValidation = [
  body("doors")
    .exists()
    .withMessage("doors is required")
    .isArray()
    .withMessage("doors must be an array"),

  body("doors.*")
    .exists()
    .withMessage("doors array cannot be empty")
    .isInt({ min: 2, max: 8 })
    .withMessage("doors must be an integar between 2 and 8")
    .toInt(),
];

exports.addCarTransmissionValidation = [
  body("transmissions")
    .exists()
    .withMessage("transmissions is required")
    .isArray()
    .withMessage("transmissions must be an array"),

  body("transmissions.*")
    .exists()
    .withMessage("transmissions array cannot be empty")
    .isString()
    .withMessage("transmissions must be a string"),
];

exports.deleteCarBrandValidation = [
  param("brandId")
    .exists()
    .withMessage("brandId is required")
    .isMongoId()
    .withMessage("Invalid brandId"),
];

exports.deleteCarModelValidation = [
  param("modelId")
    .exists()
    .withMessage("modelId is required")
    .isMongoId()
    .withMessage("Invalid modelId"),
];

exports.deleteCarTrimValidation = [
  param("trimId")
    .exists()
    .withMessage("trimId is required")
    .isMongoId()
    .withMessage("Invalid trimId"),
];

exports.deleteCategoryValidation = [
  param("categoryId")
    .exists()
    .withMessage("categoryId is required")
    .isMongoId()
    .withMessage("Invalid categoryId"),
];

exports.deleteYearValidation = [
  param("yearId")
    .exists()
    .withMessage("yearId is required")
    .isMongoId()
    .withMessage("Invalid yearId"),
];

exports.deleteBodyTypeValidate = [
  param("bodyTypeId")
    .exists()
    .withMessage("bodyTypeId is required")
    .isMongoId()
    .withMessage("Invalid bodyTypeId"),
];

exports.deleteRegionalSpecsValidate = [
  param("specsId")
    .exists()
    .withMessage("specsId is required")
    .isMongoId()
    .withMessage("Invalid specsId"),
];

exports.deleteCarHorsePowersValidate = [
  param("horsePowerId")
    .exists()
    .withMessage("horsePowerId is required")
    .isMongoId()
    .withMessage("Invalid horsePowerId"),
];

exports.deleteCarSeatingCapacityValidate = [
  param("seatingId")
    .exists()
    .withMessage("seatingId is required")
    .isMongoId()
    .withMessage("Invalid seatingId"),
];

exports.deleteCarColorsValidate = [
  param("colorId")
    .exists()
    .withMessage("colorId is required")
    .isMongoId()
    .withMessage("Invalid colorId"),
];

exports.deleteCarTechFeaturesValidate = [
  param("featureId")
    .exists()
    .withMessage("featureId is required")
    .isMongoId()
    .withMessage("Invalid featureId"),
];

exports.deleteCarOtherFeaturesValidate = [
  param("featureId")
    .exists()
    .withMessage("featureId is required")
    .isMongoId()
    .withMessage("Invalid featureId"),
];

exports.deleteCarFuelTypesValidation = [
  param("fuelTypeId")
    .exists()
    .withMessage("fuelTypeId is required")
    .isMongoId()
    .withMessage("Invalid fuelTypeId"),
  ,
];

exports.deleteCarDoorsValidation = [
  param("doorsId")
    .exists()
    .withMessage("doorsId is required")
    .isMongoId()
    .withMessage("Invalid doorsId"),
  ,
];

exports.deleteCarTransmissionValidation = [
  param("transmissionId")
    .exists()
    .withMessage("transmissionId is required")
    .isMongoId()
    .withMessage("Invalid transmissionId"),
  ,
];
