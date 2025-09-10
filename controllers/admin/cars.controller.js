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
const RentalListing = require("../../models/rentalListing.model");

const messages = require("../../messages/messages");
const adminMessages = require("../../messages/admin");

const softDelete = require("../../utils/softDelete");

const { uploadFile } = require("../../utils/s3");
const { default: mongoose } = require("mongoose");
const { USER_ROLES } = require("../../config/constants");

exports.addCarBrand = async (req, res) => {
  const { name } = req.body;
  try {
    const currentCarBrand = await CarBrand.findOne({ name });

    let logoLinks = null;
    if (req.file) {
      const file = req.file;
      const fileBuffer = file.buffer;
      const fileName = file.originalname;

      const result = await uploadFile(
        fileBuffer,
        "car_logos",
        fileName,
        currentCarBrand?.logo?.key
      );
      logoLinks = {
        url: result.url,
        key: result.key,
      };
      console.log("logoLinks", { ...logoLinks, filename: result.filename });
    }

    // Build update object conditionally
    const updateData = { name, isActive: true };
    if (logoLinks) {
      updateData.logo = logoLinks;
    }

    await CarBrand.updateOne(
      { name },
      { $set: updateData },
      {
        upsert: true,
        collation: { locale: "en", strength: 2 },
      }
    );

    const carBrand = await CarBrand.findOne({ name });

    res.status(200).json({
      success: true,
      ...adminMessages.CAR_BRAND_CREATED,
      data: carBrand,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.addCarModels = async (req, res) => {
  const { names, brandId } = req.body;
  try {
    await CarModel.bulkWrite(
      names.map((name) => ({
        updateOne: {
          filter: { name, carBrand: brandId },
          update: { $set: { name, isActive: true } },
          upsert: true,
          collation: { locale: "en", strength: 2 },
        },
      }))
    );

    const carModels = await CarModel.find({
      name: { $in: names },
      carBrand: brandId,
    });

    const bulkOps = carModels.map((model) => ({
      updateMany: {
        filter: { "carModel._id": model._id },
        update: {
          $set: {
            "carModel.name": model.name,
            "carModel._id": model._id,
          },
        },
      },
    }));

    if (bulkOps.length > 0) {
      await RentalListing.bulkWrite(bulkOps);
    }

    res.status(200).json({
      success: true,
      ...adminMessages.CAR_MODEL_CREATED,
      data: carModels,
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
    await Trim.bulkWrite(
      names.map((name) => ({
        updateOne: {
          filter: { name, carModel: modelId },
          update: { $set: { name, isActive: true } },
          upsert: true,
          collation: { locale: "en", strength: 2 },
        },
      }))
    );

    console.log({ names, modelId });

    const carTrims = await Trim.find({
      name: { $in: names },
      carModel: modelId,
    });

    const bulkOps = carTrims.map((trim) => ({
      updateMany: {
        filter: { "carTrim._id": trim._id },
        update: {
          $set: {
            "carTrim.name": trim.name,
            "carTrim._id": trim._id,
          },
        },
      },
    }));

    if (bulkOps.length > 0) {
      await RentalListing.bulkWrite(bulkOps);
    }

    res.status(200).json({
      success: true,
      ...adminMessages.CAR_TRIM_CREATED,
      data: carTrims,
    });
  } catch (err) {
    console.log("Add Trim Error", err);
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.addCarBodyTypes = async (req, res) => {
  const { names } = req.body;
  try {
    await CarBodyType.bulkWrite(
      names.map((name) => ({
        updateOne: {
          filter: { name },
          update: { $set: { name, isActive: true } },
          upsert: true,
          collation: { locale: "en", strength: 2 },
        },
      }))
    );

    const carBodyTypes = await CarBodyType.find({
      name: { $in: names },
    });

    const bulkOps = carBodyTypes.map((type) => ({
      updateMany: {
        filter: { "bodyType._id": new mongoose.Types.ObjectId(type._id) },
        update: {
          $set: {
            "bodyType.name": type.name, // update the name
          },
        },
      },
    }));

    if (bulkOps.length > 0) {
      const result = await RentalListing.bulkWrite(bulkOps);
    }

    res.status(200).json({
      success: true,
      ...adminMessages.CAR_BODY_TYPE_CREATED,
      data: carBodyTypes,
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
    await Year.bulkWrite(
      years.map((year) => ({
        updateOne: {
          filter: { year },
          update: { $set: { year, isActive: true } },
          upsert: true,
          collation: { locale: "en", strength: 2 },
        },
      }))
    );

    const years = await Year.find({ year: { $in: years } });

    const bulkOps = years.map((year) => ({
      updateMany: {
        filter: { "modelYear._id": year._id },
        update: {
          $set: {
            "modelYear.year": year.year,
            "modelYear._id": year._id,
          },
        },
      },
    }));

    if (bulkOps.length > 0) {
      await RentalListing.bulkWrite(bulkOps);
    }

    res
      .status(200)
      .json({ success: true, ...adminMessages.YEAR_CREATED, data: years });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.addCarRegionalSpecs = async (req, res) => {
  const { specs } = req.body;
  try {
    await RegionalSpecs.bulkWrite(
      specs.map((spec) => ({
        updateOne: {
          filter: { name: spec },
          update: { $set: { name: spec, isActive: true } },
          upsert: true,
          collation: { locale: "en", strength: 2 },
        },
      }))
    );

    const regionalSpecs = await RegionalSpecs.find({ name: { $in: specs } });

    const bulkOps = regionalSpecs.map((spec) => ({
      updateMany: {
        filter: { "regionalSpecs._id": spec._id },
        update: {
          $set: {
            "regionalSpecs.name": spec.name,
            "regionalSpecs._id": spec._id,
          },
        },
      },
    }));

    if (bulkOps.length > 0) {
      await RentalListing.bulkWrite(bulkOps);
    }

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
          filter: { power },
          update: { $set: { power, isActive: true } },
          upsert: true,
          collation: { locale: "en", strength: 2 },
        },
      }))
    );

    const powers = await HorsePower.find({ power: { $in: horsePowers } });

    const bulkOps = powers.map((power) => ({
      updateMany: {
        filter: { "horsePower._id": power._id },
        update: {
          $set: {
            "horsePower.power": power.power,
            "horsePower._id": power._id,
          },
        },
      },
    }));

    if (bulkOps.length > 0) {
      await RentalListing.bulkWrite(bulkOps);
    }

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
          filter: { seats: cap },
          update: { $set: { seats: cap, isActive: true } },
          upsert: true,
          collation: { locale: "en", strength: 2 },
        },
      }))
    );

    const capacities = await SeatingCapacity.find({
      seats: { $in: seatingCapacities },
    });

    const bulkOps = capacities.map((capacity) => ({
      updateMany: {
        filter: { "seatingCapacity._id": capacity._id },
        update: {
          $set: {
            "seatingCapacity.seats": capacity.seats,
            "seatingCapacity._id": capacity._id,
          },
        },
      },
    }));

    if (bulkOps.length > 0) {
      await RentalListing.bulkWrite(bulkOps);
    }

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
          update: { $set: { name: color, isActive: true } },
          upsert: true,
          collation: { locale: "en", strength: 2 },
        },
      }))
    );

    const carColors = await CarColor.find({ name: { $in: colors } });

    const bulkOps = [];
    carColors.forEach((color) => {
      bulkOps.push(
        {
          updateMany: {
            filter: { "interiorColor._id": color._id },
            update: {
              $set: {
                "interiorColor.name": color.name,
                "interiorColor._id": color._id,
              },
            },
          },
        },
        {
          updateMany: {
            filter: { "exteriorColor._id": color._id },
            update: {
              $set: {
                "exteriorColor.name": color.name,
                "exteriorColor._id": color._id,
              },
            },
          },
        }
      );
    });

    if (bulkOps.length > 0) {
      await RentalListing.bulkWrite(bulkOps);
    }

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
          update: { $set: { name: feature, isActive: true } },
          upsert: true,
          collation: { locale: "en", strength: 2 },
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
          update: { $set: { name: feature, isActive: true } },
          upsert: true,
          collation: { locale: "en", strength: 2 },
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

exports.addCarFuelTypes = async (req, res) => {
  const { fuelTypes } = req.body;
  try {
    await FuelType.bulkWrite(
      fuelTypes.map((type) => ({
        updateOne: {
          filter: { name: type },
          update: { $set: { name: type, isActive: true } },
          upsert: true,
          collation: { locale: "en", strength: 2 },
        },
      }))
    );

    const types = await FuelType.find({ name: { $in: fuelTypes } });

    const bulkOps = types.map((type) => ({
      updateMany: {
        filter: { "fuelType._id": type._id },
        update: {
          $set: {
            "fuelType.name": type.name,
            "fuelType._id": type._id,
          },
        },
      },
    }));

    if (bulkOps.length > 0) {
      await RentalListing.bulkWrite(bulkOps);
    }

    res.status(200).json({
      success: true,
      ...adminMessages.CAR_COLORS_CREATED,
      data: types,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.addCarTransmissions = async (req, res) => {
  const { transmissions } = req.body;
  try {
    await Transmission.bulkWrite(
      transmissions.map((type) => ({
        updateOne: {
          filter: { transmission: type },
          update: { $set: { transmission: type, isActive: true } },
          upsert: true,
          collation: { locale: "en", strength: 2 },
        },
      }))
    );

    const types = await Transmission.find({
      transmission: { $in: transmissions },
    });

    const bulkOps = types.map((type) => ({
      updateMany: {
        filter: { "transmission._id": type._id },
        update: {
          $set: {
            "transmission.transmission": type.transmission,
            "transmission._id": type._id,
          },
        },
      },
    }));

    if (bulkOps.length > 0) {
      await RentalListing.bulkWrite(bulkOps);
    }

    res.status(200).json({
      success: true,
      ...adminMessages.CAR_COLORS_CREATED,
      data: types,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.addCarDoors = async (req, res) => {
  const { doors } = req.body;
  try {
    await CarDoors.bulkWrite(
      doors.map((door) => ({
        updateOne: {
          filter: { doors: door },
          update: { $set: { doors: door, isActive: true } },
          upsert: true,
          collation: { locale: "en", strength: 2 },
        },
      }))
    );

    const types = await CarDoors.find({
      doors: { $in: doors },
    });

    const bulkOps = types.map((type) => ({
      updateMany: {
        filter: { "carDoors._id": type._id },
        update: {
          $set: {
            "carDoors.doors": type.doors,
            "carDoors._id": type._id,
          },
        },
      },
    }));

    if (bulkOps.length > 0) {
      await RentalListing.bulkWrite(bulkOps);
    }

    res.status(200).json({
      success: true,
      ...adminMessages.CAR_COLORS_CREATED,
      data: types,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getAllCarModels = async (req, res) => {
  try {
    const { allModels } = req.query;
    let models = {};
    if (
      allModels &&
      allModels == "true" &&
      req.user.role === USER_ROLES.ADMIN
    ) {
      models = await CarModel.find()
        .select("_id name isActive")
        .populate({ path: "carBrand", select: "_id logo name isActive" })
        .sort({ createdAt: -1 });
    } else {
      models = await CarModel.find({ isActive: true })
        .select("_id name isActive")
        .populate({ path: "carBrand", select: "_id logo name isActive" })
        .sort({ createdAt: -1 });
    }

    if (!models) {
      return res
        .status(404)
        .json({ success: false, ...adminMessages.RESOURCE_NOT_FOUND });
    }

    res.status(200).json({ success: true, models });
  } catch (err) {
    console.log("allCarModelsErr", err);
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getAllCarTrims = async (req, res) => {
  try {
    const { allTrims } = req.query;
    let carTrims = {};

    if (allTrims && allTrims == "true" && req.user.role === USER_ROLES.ADMIN) {
      carTrims = await Trim.find()
        .select("name isActive")
        .populate({ path: "carModel", select: "name" })
        .sort({ createdAt: -1 });
    } else {
      carTrims = await Trim.find({ isActive: true })
        .select("name isActive")
        .populate({ path: "carModel", select: "name" })
        .sort({ createdAt: -1 });
    }

    res.status(200).json({ success: true, carTrims });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.deleteCarBrand = async (req, res) => {
  const { brandId } = req.params;
  try {
    const brandDeleted = await softDelete(CarBrand, brandId);

    if (!brandDeleted) {
      return res.status(404).json({
        success: false,
        ...adminMessages.RESOURCE_NOT_FOUND,
      });
    }

    res.status(200).json({
      success: true,
      ...adminMessages.ACTIVE_STATUS_UPDATED,
      data: brandDeleted,
    });
  } catch (err) {
    console.log("deletBrandError", err);
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.deleteCarModel = async (req, res) => {
  const { modelId } = req.params;
  try {
    const modelDeleted = await softDelete(CarModel, modelId);

    if (!modelDeleted) {
      return res
        .status(404)
        .json({ success: false, ...adminMessages.RESOURCE_NOT_FOUND });
    }

    res.status(200).json({
      success: true,
      ...adminMessages.ACTIVE_STATUS_UPDATED,
      data: modelDeleted,
    });
  } catch (err) {
    console.log("update model active err", err);
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.deleteCarTrim = async (req, res) => {
  const { trimId } = req.params;
  try {
    const trimDeleted = await softDelete(Trim, trimId);

    if (!trimDeleted) {
      return res
        .status(404)
        .json({ success: false, ...adminMessages.RESOURCE_NOT_FOUND });
    }

    res.status(200).json({
      success: true,
      ...adminMessages.ACTIVE_STATUS_UPDATED,
      data: trimDeleted,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.deleteYear = async (req, res) => {
  const { yearId } = req.params;
  try {
    const yearDeleted = await softDelete(Year, yearId);

    if (!yearDeleted) {
      return res
        .status(404)
        .json({ success: false, ...adminMessages.RESOURCE_NOT_FOUND });
    }

    res.status(200).json({
      success: true,
      ...adminMessages.ACTIVE_STATUS_UPDATED,
      data: brandDeleted,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.deleteBodyType = async (req, res) => {
  const { bodyTypeId } = req.params;
  try {
    const bodyTypeDeleted = await softDelete(CarBodyType, bodyTypeId);

    if (!bodyTypeDeleted) {
      return res
        .status(404)
        .json({ success: false, ...adminMessages.RESOURCE_NOT_FOUND });
    }

    res.status(200).json({
      success: true,
      ...adminMessages.ACTIVE_STATUS_UPDATED,
      data: brandDeleted,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.deleteCarRegionalSpecs = async (req, res) => {
  const { specsId } = req.params;
  try {
    const specDeleted = await softDelete(RegionalSpecs, specsId);

    if (!specDeleted) {
      return res
        .status(404)
        .json({ success: false, ...adminMessages.RESOURCE_NOT_FOUND });
    }

    res.status(200).json({
      success: true,
      ...adminMessages.ACTIVE_STATUS_UPDATED,
      data: brandDeleted,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.deleteCarHorsePower = async (req, res) => {
  const { horsePowerId } = req.params;
  try {
    const powerDeleted = await softDelete(HorsePower, horsePowerId);

    if (!powerDeleted) {
      return res
        .status(404)
        .json({ success: false, ...adminMessages.RESOURCE_NOT_FOUND });
    }

    res.status(200).json({
      success: true,
      ...adminMessages.ACTIVE_STATUS_UPDATED,
      data: brandDeleted,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.deleteCarSeatingCapacity = async (req, res) => {
  const { seatingId } = req.params;
  try {
    const seatingDeleted = await softDelete(SeatingCapacity, seatingId);

    if (!seatingDeleted) {
      return res
        .status(404)
        .json({ success: false, ...adminMessages.RESOURCE_NOT_FOUND });
    }

    res.status(200).json({
      success: true,
      ...adminMessages.ACTIVE_STATUS_UPDATED,
      data: brandDeleted,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.deleteCarColors = async (req, res) => {
  const { colorId } = req.params;
  try {
    const colorDeleted = await softDelete(CarColor, colorId);

    if (!colorDeleted) {
      return res
        .status(404)
        .json({ success: false, ...adminMessages.RESOURCE_NOT_FOUND });
    }

    res.status(200).json({
      success: true,
      ...adminMessages.ACTIVE_STATUS_UPDATED,
      data: brandDeleted,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.deleteCarTechFeatures = async (req, res) => {
  const { featureId } = req.params;
  try {
    const deletedFeature = await TechnicalFeature.findOneAndDelete({
      _id: featureId,
    });

    if (!deletedFeature) {
      return res.status(404).json({
        success: false,
        ...adminMessages.RESOURCE_NOT_FOUND,
      });
    }

    res.status(200).json({
      success: true,
      ...adminMessages.ACTIVE_STATUS_UPDATED,
      data: brandDeleted,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.deleteCarOtherFeatures = async (req, res) => {
  const { featureId } = req.params;
  try {
    const deletedFeature = await OtherFeature.findOneAndDelete({
      _id: featureId,
    });

    if (!deletedFeature) {
      return res.status(404).json({
        success: false,
        ...adminMessages.RESOURCE_NOT_FOUND,
      });
    }

    res.status(200).json({
      success: true,
      ...adminMessages.ACTIVE_STATUS_UPDATED,
      data: brandDeleted,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.deleteCarFuelType = async (req, res) => {
  const { fuelTypeId } = req.params;
  try {
    const deleted = await softDelete(FuelType, fuelTypeId);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, ...adminMessages.RESOURCE_NOT_FOUND });
    }
    res.status(200).json({
      success: true,
      ...adminMessages.ACTIVE_STATUS_UPDATED,
      data: brandDeleted,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.deleteCarTransmission = async (req, res) => {
  const { transmissionId } = req.params;
  try {
    const deleted = await softDelete(Transmission, transmissionId);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, ...adminMessages.RESOURCE_NOT_FOUND });
    }
    res.status(200).json({
      success: true,
      ...adminMessages.ACTIVE_STATUS_UPDATED,
      data: brandDeleted,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.deleteCarDoors = async (req, res) => {
  const { doorsId } = req.params;
  try {
    const deleted = await softDelete(CarDoors, doorsId);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, ...adminMessages.RESOURCE_NOT_FOUND });
    }
    res.status(200).json({
      success: true,
      ...adminMessages.ACTIVE_STATUS_UPDATED,
      data: brandDeleted,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};
