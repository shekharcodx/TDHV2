const Country = require("../../models/country.model");
const State = require("../../models/state.model");
const City = require("../../models/city.model");
const adminMessages = require("../../messages/admin");
const messages = require("../../messages/messages");

exports.addCountry = async (req, res) => {
  try {
    const { countryName, countryCode } = req.body;

    const country = await Country.findOneAndUpdate(
      { name: countryName },
      {
        name: countryName,
        code: countryCode,
      },
      { new: true, upsert: true, collation: { locale: "en", strength: 2 } }
    );
    res
      .status(201)
      .json({ success: true, ...adminMessages.COUNTRY_ADDED, country });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.addStates = async (req, res) => {
  try {
    const { stateNames, countryId } = req.body;

    const ops = stateNames.map((name) => ({
      updateOne: {
        filter: { name, country: countryId },
        update: { name, country: countryId },
        upsert: true,
        collation: { locale: "en", strength: 2 },
      },
    }));

    await State.bulkWrite(ops);

    const states = await State.find({ country: countryId }).sort({ name: 1 });

    res
      .status(201)
      .json({ success: true, ...adminMessages.STATES_ADDED, states });

    res.status(201).json({
      success: true,
      ...adminMessages.STATES_ADDED,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      ...messages.INTERNAL_SERVER_ERROR,
    });
  }
};

exports.addCities = async (req, res) => {
  try {
    const { cityNames, stateId } = req.body;

    const ops = cityNames.map((name) => ({
      updateOne: {
        filter: { name, state: stateId },
        update: { name, state: stateId },
        upsert: true,
        collation: { locale: "en", strength: 2 },
      },
    }));

    await City.bulkWrite(ops);

    const cities = await City.find({ state: stateId }).sort({ name: 1 });

    res
      .status(201)
      .json({ success: true, ...adminMessages.CITIES_ADDED, cities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.deleteCountry = async (req, res) => {
  const { countryId } = req.params;
  try {
    const country = await Country.findById(countryId);
    if (!country) {
      return res
        .status(404)
        .json({ success: false, ...adminMessages.COUNTRY_NOT_FOUND });
    }
    country.isActive = false;
    await country.save();
    res.status(200).json({ success: true, ...adminMessages.COUNTRY_DELETED });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.deleteState = async (req, res) => {
  const { stateId } = req.params;
  try {
    const state = await State.findById(stateId);
    if (!state) {
      return res
        .status(404)
        .json({ success: false, ...adminMessages.STATE_NOT_FOUND });
    }
    state.isActive = false;
    await state.save();
    res.status(200).json({ success: true, ...adminMessages.STATE_DELETED });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.deleteCity = async (req, res) => {
  const { cityId } = req.params;
  try {
    const city = await City.findById(cityId);
    if (!city) {
      return res
        .status(404)
        .json({ success: false, ...adminMessages.CITY_NOT_FOUND });
    }
    city.isActive = false;
    await city.save();
    res.status(200).json({ success: true, ...adminMessages.CITY_DELETED });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};
