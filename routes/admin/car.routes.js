const express = require("express");
const router = express.Router();

const {
  addCarBrand,
  addCarModels,
  addCarTrims,
  addCarBodyTypes,
  addYears,
  addCarRegionalSpecs,
  addCarHorsePowers,
  addCarSeatingCapacity,
  addCarColors,
  addCarTechFeatures,
  addCarOtherFeatures,
  getCarBrands,
  getCarModels,
  getCarTrims,
  getYears,
  getBodyTypes,
  getCarRegionalSpecs,
  getCarHorsePowers,
  getCarSeatingCapacities,
  getCarColors,
  getCarTechFeatures,
  getCarOtherFeatures,
  deleteCarBrand,
  deleteCarModel,
  deleteCarTrim,
  deleteYear,
  deleteBodyType,
  deleteCarRegionalSpecs,
  deleteCarHorsePower,
  deleteCarSeatingCapacity,
  deleteCarColors,
  deleteCarTechFeatures,
  deleteCarOtherFeatures,
} = require("../../controllers/admin/cars.controller");

const {
  addCarBrandValidation,
  addCarModelsValidation,
  addCarBodyTypesValidation,
  addCarTrimsValidation,
  addYearsValidation,
  addCarRegionalSpecsValidation,
  addCarHorsePowersValidate,
  addCarSeatingCapacityValidate,
  addCarColorsValidate,
  addCarTechFeaturesValidate,
  getCarModelsValidation,
  getCarTrimsValidation,
  deleteCarBrandValidation,
  deleteCarModelValidation,
  deleteCarTrimValidation,
  deleteYearValidation,
  deleteBodyTypeValidate,
  deleteRegionalSpecsValidate,
  deleteCarHorsePowersValidate,
  deleteCarSeatingCapacityValidate,
  deleteCarColorsValidate,
  deleteCarTechFeaturesValidate,
  deleteCarOtherFeaturesValidate,
} = require("../../validations/admin/car.validation");

const upload = require("../../middlewares/upload.middleware");

const validate = require("../../middlewares/validate.middleware");

router.post(
  "/addCarBrand",
  upload.single("logo"),
  addCarBrandValidation,
  validate,
  addCarBrand
);

router.post("/addCarModels", addCarModelsValidation, validate, addCarModels);

router.post("/addCarTrims", addCarTrimsValidation, validate, addCarTrims);

router.post(
  "/addCarBodyTypes",
  addCarBodyTypesValidation,
  validate,
  addCarBodyTypes
);

router.post("/addYears", addYearsValidation, validate, addYears);

router.post(
  "/addCarRegionalSpecs",
  addCarRegionalSpecsValidation,
  validate,
  addCarRegionalSpecs
);

router.post(
  "/addCarHorsePowers",
  addCarHorsePowersValidate,
  validate,
  addCarHorsePowers
);

router.post(
  "/addCarSeatingCapacities",
  addCarSeatingCapacityValidate,
  validate,
  addCarSeatingCapacity
);

router.post("/addCarColors", addCarColorsValidate, validate, addCarColors);

router.post(
  "/addCarTechFeatures",
  addCarTechFeaturesValidate,
  validate,
  addCarTechFeatures
);

router.post(
  "/addCarOtherFeatures",
  addCarTechFeaturesValidate,
  validate,
  addCarOtherFeatures
);

router.get("/getCarBrands", getCarBrands);

router.get(
  "/getCarModels/:carBrandId",
  getCarModelsValidation,
  validate,
  getCarModels
);

router.get(
  "/getCarTrims/:carModelId",
  getCarTrimsValidation,
  validate,
  getCarTrims
);

router.get("/getYears", getYears);

router.get("/getBodyTypes", getBodyTypes);

router.get("/getCarRegionalSpecs", getCarRegionalSpecs);

router.get("/getCarHorsePowers", getCarHorsePowers);

router.get("/getCarSeatingCapacities", getCarSeatingCapacities);

router.get("/getCarColors", getCarColors);

router.get("/getCarTechFeatures", getCarTechFeatures);

router.get("/getCarOtherFeatures", getCarOtherFeatures);

router.delete(
  "/carBrand/:brandId",
  deleteCarBrandValidation,
  validate,
  deleteCarBrand
);

router.delete(
  "/carModel/:modelId",
  deleteCarModelValidation,
  validate,
  deleteCarModel
);

router.delete(
  "/carTrim/:trimId",
  deleteCarTrimValidation,
  validate,
  deleteCarTrim
);

router.delete("/year/:yearId", deleteYearValidation, validate, deleteYear);

router.delete(
  "/bodyType/:bodyTypeId",
  deleteBodyTypeValidate,
  validate,
  deleteBodyType
);

router.delete(
  "/carRegionalSpecs/:specsId",
  deleteRegionalSpecsValidate,
  validate,
  deleteCarRegionalSpecs
);

router.delete(
  "/carHorsePower/:horsePowerId",
  deleteCarHorsePowersValidate,
  validate,
  deleteCarHorsePower
);

router.delete(
  "/carSeating/:seatingId",
  deleteCarSeatingCapacityValidate,
  validate,
  deleteCarSeatingCapacity
);

router.delete(
  "/carColor/:colorId",
  deleteCarColorsValidate,
  validate,
  deleteCarColors
);

router.delete(
  "/carTechFeature/:featureId",
  deleteCarTechFeaturesValidate,
  validate,
  deleteCarTechFeatures
);

router.delete(
  "/carOtherFeature/:featureId",
  deleteCarOtherFeaturesValidate,
  validate,
  deleteCarOtherFeatures
);

module.exports = router;
