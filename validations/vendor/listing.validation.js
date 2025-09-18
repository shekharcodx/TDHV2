const { body, param } = require("express-validator");

exports.getStatesValidation = [
  param("countryId")
    .exists()
    .withMessage("countryId is required")
    .isMongoId()
    .withMessage("Invalid countryId"),
];

exports.getCitiesValidation = [
  param("stateId")
    .exists()
    .withMessage("stateId is required")
    .isMongoId()
    .withMessage("Invalid stateId"),
];

exports.rentalListingValidator = [
  body("carBrand").isMongoId().withMessage("Invalid carBrand ID"),

  body("carModel").isMongoId().withMessage("Invalid carModel ID"),

  body("carTrim").isMongoId().withMessage("Invalid carTrim ID"),

  body("carCategory").isMongoId("invalid carCategory ID"),

  body("regionalSpecs").isMongoId().withMessage("Invalid regionalSpecs ID"),

  body("modelYear").isMongoId().withMessage("Invalid modelYear ID"),

  body("mileage")
    .isNumeric()
    .withMessage("mileage must be a number")
    .isInt({ min: 0 })
    .withMessage("mileage cannot be negative"),

  body("extraMileageRate")
    .notEmpty()
    .withMessage("extraMileageRate is required field")
    .isInt()
    .withMessage("extraMileageRate must be a number")
    .toInt(),

  body("dailyMileage")
    .notEmpty()
    .withMessage("dailyMileage is required field")
    .isInt()
    .withMessage("dailyMileage must be a number")
    .toInt(),

  body("weeklyMileage")
    .optional()
    .notEmpty()
    .withMessage("weeklyMileage is required field")
    .isInt()
    .withMessage("weeklyMileage must be a number")
    .toInt(),

  body("monthlyMileage")
    .notEmpty()
    .withMessage("monthlyMileage is required field")
    .isInt()
    .withMessage("monthlyMileage must be a number")
    .toInt(),

  body("bodyType").isMongoId().withMessage("Invalid bodyType ID"),

  body("carInsurance").notEmpty().withMessage("carInsurance is required"),

  body("rentPerDay")
    .isNumeric()
    .withMessage("rentPerDay must be a number")
    .isInt({ min: 0 })
    .withMessage("rentPerDay cannot be negative"),

  body("rentPerWeek")
    .isNumeric()
    .withMessage("rentPerWeek must be a number")
    .isInt({ min: 0 })
    .withMessage("rentPerWeek cannot be negative"),

  body("rentPerMonth")
    .isNumeric()
    .withMessage("rentPerMonth must be a number")
    .isInt({ min: 0 })
    .withMessage("rentPerMonth cannot be negative"),

  body("title")
    .notEmpty()
    .withMessage("title is required")
    .isLength({ min: 3 })
    .withMessage("title must be at least 3 characters long"),

  body("description")
    .optional()
    .isString()
    .withMessage("description must be a string"),

  body("fuelType")
    .exists()
    .withMessage("fuelType is required")
    .isMongoId()
    .withMessage("Invalid interior fuelType"),

  ,
  body("interiorColor").isMongoId().withMessage("Invalid interiorColor ID"),

  body("exteriorColor").isMongoId().withMessage("Invalid exteriorColor ID"),

  body("warranty").notEmpty().withMessage("warranty is required"),

  body("carDoors")
    .exists()
    .withMessage("carDoors is required")
    .isMongoId()
    .withMessage("Invalid interior carDoors"),

  body("transmission")
    .exists()
    .withMessage("transmission is required")
    .isMongoId()
    .withMessage("Invalid transmission"),

  body("seatingCapacity").isMongoId().withMessage("Invalid seatingCapacity ID"),

  body("horsePower").isMongoId().withMessage("Invalid horsePower ID"),

  body("techFeatures")
    .optional()
    .isArray()
    .withMessage("techFeatures must be an array"),

  body("techFeatures.*")
    .optional()
    .isMongoId()
    .withMessage("Each technicalFeature must be a valid ID"),

  body("otherFeatures")
    .optional()
    .isArray()
    .withMessage("otherFeatures must be an array"),

  body("otherFeatures.*")
    .optional()
    .isMongoId()
    .withMessage("Each otherFeature must be a valid ID"),

  body("location").notEmpty().withMessage("location is required"),

  body("airBags")
    .notEmpty()
    .withMessage("airBags is required field")
    .isInt()
    .withMessage("airBags must be a number")
    .toInt(),

  body("tankCapacity")
    .notEmpty()
    .withMessage("tankCapacity is required field")
    .isInt()
    .withMessage("tankCapacity must be a number")
    .toInt(),

  body("images").custom((value, { req }) => {
    console.log("images", req.files.length);
    if (!req.files || req.files.length === 0) {
      throw new Error("At least one image is required");
    }
    return true;
  }),

  body("deliveryCharges")
    .notEmpty()
    .withMessage("deliveryCharges is required field")
    .isInt()
    .withMessage("deliveryCharges must be a number")
    .toInt(),

  body("tollCharges")
    .notEmpty()
    .withMessage("tollCharges is required field")
    .isInt()
    .withMessage("tollCharges must be a number")
    .toInt(),

  body("securityDeposit")
    .optional()
    .isInt()
    .withMessage("securityDeposit must be a number")
    .toInt(),

  body("minRentalDays")
    .notEmpty()
    .withMessage("minRentalDays is required field")
    .isInt()
    .withMessage("minRentalDays must be a number")
    .toInt(),

  body("pickupAvailable")
    .exists()
    .withMessage("pickupAvailable is required field")
    .isBoolean()
    .withMessage("pickupAvailable must be a boolean"),

  body("depositRequired")
    .exists()
    .withMessage("depositRequired is required field")
    .isBoolean()
    .withMessage("depositRequired must be a boolean"),

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

  body("carCategory").optional().isMongoId("invalid carCategory ID"),
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

  body("extraMileageRate")
    .optional()
    .isInt()
    .withMessage("extraMileageRate must be a number")
    .toInt(),

  body("dailyMileage")
    .optional()
    .isInt()
    .withMessage("dailyMileage must be a number")
    .toInt(),

  body("weeklyMileage")
    .optional()
    .isInt()
    .withMessage("weeklyMileage must be a number")
    .toInt(),

  body("monthlyMileage")
    .optional()
    .isInt()
    .withMessage("monthlyMileage must be a number")
    .toInt(),

  body("carInsurance")
    .optional()
    .notEmpty()
    .withMessage("carInsurance is required"),
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

  body("airBags")
    .optional()
    .isInt()
    .withMessage("airBags must be an integar")
    .toInt(),

  body("tankCapacity").optional().isInt().withMessage("tankCapacity").toInt(),

  body("deliveryCharges")
    .optional()
    .isInt()
    .withMessage("deliveryCharges must be a number")
    .toInt(),

  body("tollCharges")
    .optional()
    .isInt()
    .withMessage("tollCharges must be a number")
    .toInt(),

  body("securityDeposit")
    .optional()
    .isInt()
    .withMessage("securityDeposit must be a number")
    .toInt(),

  body("minRentalDays")
    .optional()
    .isInt()
    .withMessage("minRentalDays must be a number")
    .toInt(),

  body("pickupAvailable")
    .optional()
    .isBoolean()
    .withMessage("pickupAvailable must be a boolean"),

  body("depositRequired")
    .optional()
    .isBoolean()
    .withMessage("depositRequired must be a boolean"),
];
