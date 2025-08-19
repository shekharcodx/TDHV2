const CarBrand = require("../../models/carBrand.model");
const CarModel = require("../../models/carModel.model");
const CarBodyType = require("../../models/carBodyType.model");
const CarTrim = require("../../models/carTrims.model");
const Year = require("../../models/years.model");
const RegionalSpecs = require("../../models/carRegionalSpecs.model");
const HorsePower = require("../../models/carHoursePower.model");
const SeatingCapacity = require("../../models/carSeatingCapacity.model");
const CarColor = require("../../models/carColor.model");
const TechnicalFeature = require("../../models/carTechnicalFeatures.model");
const OtherFeature = require("../../models/carOtherFeatures.model");

const messages = require("../../messages/messages");
const adminMessages = require("../../messages/admin");

const { uploadFile } = require("../../utils/s3");

exports.addCarBrand = async (req, res) => {
  const { name } = req.body;
  try {
    let logoLinks = null;
    if (req.file) {
      const file = req.file;
      const fileBuffer = file.buffer;
      const fileName = file.originalname;

      const result = await uploadFile(fileBuffer, "car_logos", fileName);
      logoLinks = {
        url: result.url,
        key: result.key,
      };
    }
    const carBrand = await CarBrand.create({ name, logo: logoLinks });
    res.status(200).json({ success: true, ...adminMessages.CAR_BRAND_CREATED });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.addCarModels = async (req, res) => {
  const { names, brandId } = req.body;
  try {
    const carModel = await CarModel.insertMany(
      names.map((name) => ({ name, carBrand: brandId }))
    );
    res.status(200).json({
      success: true,
      ...adminMessages.CAR_MODEL_CREATED,
      data: carModel,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.addCarTrims = async (req, res) => {
  const { names, modelId } = req.body;
  try {
    const carTrim = await CarTrim.insertMany(
      names.map((name) => ({ name, carModel: modelId }))
    );
    res.status(200).json({
      success: true,
      ...adminMessages.CAR_TRIM_CREATED,
      data: carTrim,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.addCarBodyTypes = async (req, res) => {
  const { names } = req.body;
  try {
    const carBodyType = await CarBodyType.insertMany(
      names.map((name) => ({ name }))
    );
    res.status(200).json({
      success: true,
      ...adminMessages.CAR_BODY_TYPE_CREATED,
      data: carBodyType,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.addYears = async (req, res) => {
  const { years } = req.body;
  try {
    const year = await Year.insertMany(years.map((year) => ({ year })));
    res
      .status(200)
      .json({ success: true, ...adminMessages.YEAR_CREATED, data: year });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.addCarRegionalSpecs = async (req, res) => {
  const { specs } = req.body;
  try {
    const regionalSpecs = await RegionalSpecs.insertMany(
      specs.map((spec) => ({ name: spec }))
    );

    res.status(200).json({
      success: true,
      ...adminMessages.REGIONAL_SPECS_CREATED,
      data: regionalSpecs,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.addCarHorsePowers = async (req, res) => {
  const { horsePowers } = req.body;
  try {
    await HorsePower.bulkWrite(
      horsePowers.map((power) => ({
        updateOne: {
          filter: { name: power },
          update: { $set: { name: power } },
          upsert: true,
        },
      }))
    );

    const powers = await HorsePower.find({ name: { $in: horsePowers } });

    res.status(200).json({
      success: true,
      ...adminMessages.HORSE_POWERS_CREATED,
      data: powers,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.addCarSeatingCapacity = async (req, res) => {
  const { seatingCapacities } = req.body;
  try {
    await SeatingCapacity.bulkWrite(
      seatingCapacities.map((cap) => ({
        updateOne: {
          filter: { name: cap },
          update: { $set: { name: cap } },
          upsert: true,
        },
      }))
    );

    const capacities = await SeatingCapacity.find({
      name: { $in: seatingCapacities },
    });

    res.status(200).json({
      success: true,
      ...adminMessages.SEATING_CAPACITIES_CREATED,
      data: capacities,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.addCarColors = async (req, res) => {
  const { colors } = req.body;
  try {
    await CarColor.bulkWrite(
      colors.map((color) => ({
        updateOne: {
          filter: { name: color },
          update: { $set: { name: color } },
          upsert: true,
        },
      }))
    );

    const carColors = await CarColor.find({ name: { $in: colors } });

    res.status(200).json({
      success: true,
      ...adminMessages.CAR_COLORS_CREATED,
      data: carColors,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.addCarTechFeatures = async (req, res) => {
  const { features } = req.body;
  try {
    await TechnicalFeature.bulkWrite(
      features.map((feature) => ({
        updateOne: {
          filter: { name: feature },
          update: { $set: { name: feature } },
          upsert: true,
        },
      }))
    );

    const techFeatures = await TechnicalFeature.find({
      name: { $in: features },
    });

    res.status(200).json({
      success: true,
      ...adminMessages.FEATURES_ADDED_SUCCESSFULLY,
      data: techFeatures,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.addCarOtherFeatures = async (req, res) => {
  const { features } = req.body;
  try {
    await OtherFeature.bulkWrite(
      features.map((feature) => ({
        updateOne: {
          filter: { name: feature },
          update: { $set: { name: feature } },
          upsert: true,
        },
      }))
    );

    const otherFeatures = await OtherFeature.find({
      name: { $in: features },
    });

    res.status(200).json({
      success: true,
      ...adminMessages.FEATURES_ADDED_SUCCESSFULLY,
      data: otherFeatures,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getCarBrands = async (req, res) => {
  try {
    const carBrands = await CarBrand.find({ isActive: true }).select(
      "name logo"
    );

    res.status(200).json({ success: true, carBrands });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getCarModels = async (req, res) => {
  const { carBrandId } = req.params;
  try {
    const carModels = await CarModel.find({
      isActive: true,
      carBrand: carBrandId,
    }).select("name");

    res.status(200).json({ success: true, carModels });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getCarTrims = async (req, res) => {
  const { carModelId } = req.params;
  try {
    const carTrims = await CarTrim.find({
      isActive: true,
      carModel: carModelId,
    }).select("name");

    res.status(200).json({ success: true, carTrims });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getYears = async (req, res) => {
  try {
    const years = await Year.find({ isActive: true }).select("year");
    res.status(200).json({ success: true, years });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getCarRegionalSpecs = async (req, res) => {
  try {
    const specs = await RegionalSpecs.find({ isActive: true }).select("name");
    res.status(200).json({ success: true, specs });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getCarHorsePowers = async (req, res) => {
  try {
    const powers = await HorsePower.find({ isActive: true });
    res.status(200).json({ success: true, horsePowers: powers });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getCarSeatingCapacities = async (req, res) => {
  try {
    const capacities = await SeatingCapacity.find({ isActive: true });
    res.status(200).json({ success: true, seatingCapacities: capacities });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getCarColors = async (req, res) => {
  try {
    const colors = await CarColor.find({ isActive: true });
    res.status(200).json({ success: true, colors });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getCarTechFeatures = async (req, res) => {
  try {
    const features = await TechnicalFeature.find();
    res.status(200).json({ success: true, features });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getCarOtherFeatures = async (req, res) => {
  try {
    const features = await OtherFeature.find();
    res.status(200).json({ success: true, features });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.deleteCarBrand = async (req, res) => {
  const { brandId } = req.params;
  try {
    await CarBrand.findOneAndUpdate(
      { _id: brandId },
      { isActive: false },
      { new: true }
    );
    res.status(200).json({ success: true, ...adminMessages.BRAND_DELETED });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.deleteCarModel = async (req, res) => {
  const { modelId } = req.params;
  try {
    await CarModel.findOneAndUpdate(
      { _id: modelId },
      { isActive: false },
      { new: true }
    );
    res.status(200).json({ success: true, ...adminMessages.MODEL_DELETED });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.deleteCarTrim = async (req, res) => {
  const { trimId } = req.params;
  try {
    await CarTrim.findOneAndUpdate(
      { _id: trimId },
      { isActive: false },
      { new: true }
    );
    res.status(200).json({ success: true, ...adminMessages.TRIM_DELETED });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.deleteYear = async (req, res) => {
  const { yearId } = req.params;
  try {
    await Year.findOneAndUpdate(
      { _id: yearId },
      { isActive: false },
      { new: true }
    );
    res.status(200).json({ success: true, ...adminMessages.YEAR_DELETED });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};
