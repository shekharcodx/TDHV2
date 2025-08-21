const { body, param } = require("express-validator");

exports.getStatesValidation = [
  param("countryId")
    .exists()
    .withMessage("Country ID is required")
    .isMongoId()
    .withMessage("Invalid Country ID"),
];

exports.getCitiesValidation = [
  param("stateId")
    .exists()
    .withMessage("State ID is required")
    .isMongoId()
    .withMessage("Invalid State ID"),
];

exports.rentalListingValidator = [
  body("carBrand").isMongoId().withMessage("Invalid car brand ID"),

  body("carModel").isMongoId().withMessage("Invalid car model ID"),

  body("carTrim").isMongoId().withMessage("Invalid car trim ID"),

  body("regionalSpecs").isMongoId().withMessage("Invalid regional specs ID"),

  body("modelYear").isMongoId().withMessage("Invalid model year ID"),

  body("mileage")
    .isNumeric()
    .withMessage("Mileage must be a number")
    .isInt({ min: 0 })
    .withMessage("Mileage cannot be negative"),

  body("bodyType").isMongoId().withMessage("Invalid body type ID"),

  body("carInsurance").notEmpty().withMessage("Car insurance is required"),

  body("rentPerDay")
    .isNumeric()
    .withMessage("Rent per day must be a number")
    .isInt({ min: 0 })
    .withMessage("Rent per day cannot be negative"),

  body("rentPerMonth")
    .isNumeric()
    .withMessage("Rent per month must be a number")
    .isInt({ min: 0 })
    .withMessage("Rent per month cannot be negative"),

  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters long"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),

  body("fuelType")
    .exists()
    .withMessage("fuelType is required")
    .isMongoId()
    .withMessage("Invalid interior fuelType"),

  ,
  body("interiorColor").isMongoId().withMessage("Invalid interior color ID"),

  body("exteriorColor").isMongoId().withMessage("Invalid exterior color ID"),

  body("warranty").notEmpty().withMessage("Warranty is required"),

  body("carDoors")
    .exists()
    .withMessage("carDoors is required")
    .isMongoId()
    .withMessage("Invalid interior carDoors"),

  body("transmission")
    .exists()
    .withMessage("transmission is required")
    .isMongoId()
    .withMessage("Invalid interior transmission"),

  body("seatingCapacity")
    .isMongoId()
    .withMessage("Invalid seating capacity ID"),

  body("horsePower").isMongoId().withMessage("Invalid horsepower ID"),

  body("techFeatures")
    .optional()
    .isArray()
    .withMessage("techFeatures must be an array"),

  body("techFeatures.*")
    .optional()
    .isMongoId()
    .withMessage("Each technical feature must be a valid ID"),

  body("otherFeatures")
    .optional()
    .isArray()
    .withMessage("otherFeatures must be an array"),

  body("otherFeatures.*")
    .optional()
    .isMongoId()
    .withMessage("Each other feature must be a valid ID"),

  body("location").notEmpty().withMessage("Location is required"),

  body("images").custom((value, { req }) => {
    console.log("images", req.files.length);
    if (!req.files || req.files.length === 0) {
      throw new Error("At least one image is required");
    }
    return true;
  }),

  body("status").optional().isInt().withMessage("Invalid status"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be true or false"),

  body("isFeatured")
    .optional()
    .isBoolean()
    .withMessage("isFeatured must be true or false"),

  body("isPremium")
    .optional()
    .isBoolean()
    .withMessage("isPremium must be true or false"),
];
