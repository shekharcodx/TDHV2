const express = require("express");
const router = express.Router();

const {
  getCarModelsValidation,
  getCarTrimsValidation,
} = require("../../validations/common/car.validation");
const validate = require("../../middlewares/validate.middleware");
const {
  getCarModels,
  getCarTrims,
  getCategories,
  getYears,
  getBodyTypes,
  getCarRegionalSpecs,
  getCarHorsePowers,
  getCarSeatingCapacities,
  getCarColors,
  getCarTechFeatures,
  getCarOtherFeatures,
  getCarFuelType,
  getCarTransmission,
  getCarDoors,
  getCarBrands,
} = require("../../controllers/common/cars.controller");

router.get("/carBrands", getCarBrands);

router.get(
  "/carModels/:carBrandId",
  getCarModelsValidation,
  validate,
  getCarModels
);

router.get(
  "/carTrims/:carModelId",
  getCarTrimsValidation,
  validate,
  getCarTrims
);

router.get("/carCategories", getCategories);

router.get("/years", getYears);

router.get("/bodyTypes", getBodyTypes);

router.get("/carRegionalSpecs", getCarRegionalSpecs);

router.get("/carHorsePowers", getCarHorsePowers);

router.get("/carSeatingCapacities", getCarSeatingCapacities);

router.get("/carColors", getCarColors);

router.get("/carTechFeatures", getCarTechFeatures);

router.get("/carOtherFeatures", getCarOtherFeatures);

router.get("/carFuelTypes", getCarFuelType);

router.get("/carTransmissions", getCarTransmission);

router.get("/carDoors", getCarDoors);

module.exports = router;
