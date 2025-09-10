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
  // getCarModels,
  // getCarTrims,
  // getYears,
  // getBodyTypes,
  // getCarRegionalSpecs,
  // getCarHorsePowers,
  // getCarSeatingCapacities,
  // getCarColors,
  // getCarTechFeatures,
  // getCarOtherFeatures,
  // getCarFuelType,
  // getCarDoors,
  // getCarTransmission,
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
  deleteCarTransmission,
  deleteCarDoors,
  deleteCarFuelType,
  addCarTransmissions,
  addCarFuelTypes,
  addCarDoors,
  getAllCarModels,
  getAllCarTrims,
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
  // getCarModelsValidation,
  // getCarTrimsValidation,
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
  deleteCarFuelTypesValidation,
  deleteCarDoorsValidation,
  deleteCarTransmissionValidation,
  addCarTransmissionValidation,
  addCarDoorsValidation,
  addCarFuelTypesValidation,
} = require("../../validations/admin/car.validation");

const upload = require("../../middlewares/upload.middleware");

const validate = require("../../middlewares/validate.middleware");

router.post(
  "/carBrand",
  upload.single("logo"),
  addCarBrandValidation,
  validate,
  addCarBrand
);

router.post("/carModels", addCarModelsValidation, validate, addCarModels);

router.post("/carTrims", addCarTrimsValidation, validate, addCarTrims);

router.post(
  "/carBodyTypes",
  addCarBodyTypesValidation,
  validate,
  addCarBodyTypes
);

router.post("/years", addYearsValidation, validate, addYears);

router.post(
  "/carRegionalSpecs",
  addCarRegionalSpecsValidation,
  validate,
  addCarRegionalSpecs
);

router.post(
  "/carHorsePowers",
  addCarHorsePowersValidate,
  validate,
  addCarHorsePowers
);

router.post(
  "/carSeatingCapacities",
  addCarSeatingCapacityValidate,
  validate,
  addCarSeatingCapacity
);

router.post("/carColors", addCarColorsValidate, validate, addCarColors);

router.post(
  "/carTechFeatures",
  addCarTechFeaturesValidate,
  validate,
  addCarTechFeatures
);

router.post(
  "/carOtherFeatures",
  addCarTechFeaturesValidate,
  validate,
  addCarOtherFeatures
);

router.post(
  "/carFuelTypes",
  addCarFuelTypesValidation,
  validate,
  addCarFuelTypes
);

router.post(
  "/carTransmissions",
  addCarTransmissionValidation,
  validate,
  addCarTransmissions
);

router.post("/carDoors", addCarDoorsValidation, validate, addCarDoors);

router.get("/carModels", getAllCarModels);

router.get("/carTrims", getAllCarTrims);

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

router.delete(
  "/carFuelType/:fuelTypeId",
  deleteCarFuelTypesValidation,
  validate,
  deleteCarFuelType
);

router.delete(
  "/carDoors/:doorsId",
  deleteCarDoorsValidation,
  validate,
  deleteCarDoors
);

router.delete(
  "/carTransmission/:transmissionId",
  deleteCarTransmissionValidation,
  validate,
  deleteCarTransmission
);

module.exports = router;
