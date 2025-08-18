const express = require("express");
const router = express.Router();

const {
  addCarBrand,
  addCarModels,
  addCarTrims,
  addCarBodyTypes,
  addYears,
  getCarBrands,
  getCarModels,
  getCarTrims,
  getYears,
  deleteCarBrand,
  deleteCarModel,
  deleteCarTrim,
  deleteYear,
} = require("../../controllers/admin/cars.controller");

const {
  addCarBrandValidation,
  addCarModelsValidation,
  addCarBodyTypesValidation,
  addCarTrimsValidation,
  addYearsValidation,
  getCarModelsValidation,
  getCarTrimsValidation,
  deleteCarBrandValidation,
  deleteCarModelValidation,
  deleteCarTrimValidation,
  deleteYearValidation,
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

router.delete(
  "/deleteCarBrand/:brandId",
  deleteCarBrandValidation,
  validate,
  deleteCarBrand
);

router.delete(
  "/deleteCarModel/:modelId",
  deleteCarModelValidation,
  validate,
  deleteCarModel
);

router.delete(
  "/deleteCarTrim/:trimId",
  deleteCarTrimValidation,
  validate,
  deleteCarTrim
);

router.delete(
  "/deleteYear/:yearId",
  deleteYearValidation,
  validate,
  deleteYear
);

module.exports = router;
