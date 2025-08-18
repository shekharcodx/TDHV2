const CarBrand = require("../../models/carBrand.model");
const CarModel = require("../../models/carModel.model");
const CarBodyType = require("../../models/carBodyType.model");
const CarTrim = require("../../models/carTrims.model");
const Year = require("../../models/years.model");

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
