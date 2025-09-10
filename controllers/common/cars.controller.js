const CarBrand = require("../../models/carModels/carBrand.model");
const CarModel = require("../../models/carModels/carModel.model");
const CarBodyType = require("../../models/carModels/carBodyType.model");
const Trim = require("../../models/carModels/carTrims.model");
const Year = require("../../models/carModels/years.model");
const RegionalSpecs = require("../../models/carModels/carRegionalSpecs.model");
const HorsePower = require("../../models/carModels/carHoursePower.model");
const SeatingCapacity = require("../../models/carModels/carSeatingCapacity.model");
const CarColor = require("../../models/carModels/carColor.model");
const TechnicalFeature = require("../../models/carModels/carTechnicalFeatures.model");
const OtherFeature = require("../../models/carModels/carOtherFeatures.model");
const FuelType = require("../../models/carModels/carFuelType.model");
const Transmission = require("../../models/carModels/carTransmission.model");
const CarDoors = require("../../models/carModels/carDoors.model");

const messages = require("../../messages/messages");
const { USER_ROLES } = require("../../config/constants");

exports.getCarBrands = async (req, res) => {
  try {
    let carBrands;

    if (req.user.role !== USER_ROLES.ADMIN) {
      carBrands = await CarBrand.find({ isActive: true })
        .select("name logo isActive")
        .sort({ createdAt: -1 });
    } else {
      carBrands = await CarBrand.find()
        .select("name logo isActive")
        .sort({ createdAt: -1 });
    }

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
    })
      .select("_id name isActive")
      .populate({ path: "carBrand", select: "_id logo name isActive" });

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
    const carTrims = await Trim.find({
      isActive: true,
      carModel: carModelId,
    })
      .select("name")
      .populate({ path: "carModel", select: "name" });

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

exports.getBodyTypes = async (req, res) => {
  try {
    const bodyTypes = await CarBodyType.find({ isActive: true });

    res.status(200).json({ success: true, bodyTypes });
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

exports.getCarFuelType = async (req, res) => {
  try {
    const fuelTypes = await FuelType.find({ isActive: true }).select(
      "name isActive"
    );
    res.status(200).json({ success: true, fuelTypes });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getCarTransmission = async (req, res) => {
  try {
    const transmissions = await Transmission.find({ isActive: true }).select(
      "transmission isActive"
    );
    res.status(200).json({ success: true, transmissions });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getCarDoors = async (req, res) => {
  try {
    const doors = await CarDoors.find({ isActive: true }).select(
      "doors isActive"
    );
    res.status(200).json({ success: true, doors });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};
