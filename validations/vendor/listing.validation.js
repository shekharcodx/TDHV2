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

  body("rentPerWeek")
    .isNumeric()
    .withMessage("Rent per week must be a number")
    .isInt({ min: 0 })
    .withMessage("Rent per week cannot be negative"),

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

exports.listingIsActiveValidation = [
  param("listingId")
    .exists()
    .withMessage("listingId is required")
    .isMongoId()
    .withMessage("Invalid listingId"),
  body("isActive")
    .exists()
    .withMessage("isActive is required")
    .isBoolean()
    .withMessage("isActive must be boolean"),
];

exports.updateListingValidation = [
  // Validate listingId param
  param("listingId")
    .exists()
    .withMessage("listingId is required")
    .isMongoId()
    .withMessage("Invalid listingId"),

  // Validate reference fields (optional, but must be valid Mongo IDs if provided)
  body("carBrand")
    .optional()
    .isMongoId()
    .withMessage("Invalid carBrand ID")
    .bail()
    .custom((carBrand, { req }) => {
      if (carBrand && !req.body.carModel) {
        throw new Error("carModel is required when carBrand is provided");
      }
      return true;
    }),

  body("carModel")
    .optional()
    .isMongoId()
    .withMessage("Invalid carModel ID")
    .bail()
    .custom((carModel, { req }) => {
      if (carModel && !req.body.carTrim) {
        throw new Error("carTrim is required when carModel is provided");
      }
      if (!carModel && req.body.carTrim) {
        throw new Error("carModel is required when carTrim is provided");
      }
      return true;
    }),

  body("carTrim")
    .optional()
    .isMongoId()
    .withMessage("Invalid carTrim ID")
    .bail()
    .custom((carTrim, { req }) => {
      if (carTrim && !req.body.carModel) {
        throw new Error("carModel is required when carTrim is provided");
      }
      if (carTrim && !req.body.carBrand) {
        throw new Error("carBrand is required when carTrim is provided");
      }
      return true;
    }),

  body("regionalSpecs")
    .optional()
    .isMongoId()
    .withMessage("Invalid regionalSpecs ID"),
  body("modelYear").optional().isMongoId().withMessage("Invalid modelYear ID"),
  body("bodyType").optional().isMongoId().withMessage("Invalid bodyType ID"),
  body("fuelType").optional().isMongoId().withMessage("Invalid fuelType ID"),
  body("interiorColor")
    .optional()
    .isMongoId()
    .withMessage("Invalid interiorColor ID"),
  body("exteriorColor")
    .optional()
    .isMongoId()
    .withMessage("Invalid exteriorColor ID"),
  body("transmission")
    .optional()
    .isMongoId()
    .withMessage("Invalid transmission ID"),
  body("carDoors").optional().isMongoId().withMessage("Invalid carDoors ID"),
  body("seatingCapacity")
    .optional()
    .isMongoId()
    .withMessage("Invalid seatingCapacity ID"),
  body("horsePower")
    .optional()
    .isMongoId()
    .withMessage("Invalid horsePower ID"),

  // Simple fields
  body("mileage")
    .optional()
    .isNumeric()
    .withMessage("mileage must be a number"),
  body("carInsurance")
    .optional()
    .isBoolean()
    .withMessage("carInsurance must be true or false")
    .toBoolean(),
  body("rentPerDay")
    .optional()
    .isNumeric()
    .withMessage("rentPerDay must be a number"),
  body("rentPerWeek")
    .optional()
    .isNumeric()
    .withMessage("rentPerWeek must be a number"),
  body("rentPerMonth")
    .optional()
    .isNumeric()
    .withMessage("rentPerMonth must be a number"),
  body("title").optional().isString().withMessage("title must be a string"),
  body("description")
    .optional()
    .isString()
    .withMessage("description must be a string"),
  body("warranty")
    .optional()
    .isString()
    .withMessage("warranty must be a string"),
  body("techFeatures")
    .optional()
    .isArray()
    .withMessage("techFeatures must be an array"),
  body("otherFeatures")
    .optional()
    .isArray()
    .withMessage("otherFeatures must be an array"),
  body("location")
    .optional()
    .isString()
    .withMessage("location must be a string"),
];
