const messages = require("../../messages/messages");
const countryModel = require("../../models/country.model");
const stateModel = require("../../models/state.model");
const cityModel = require("../../models/city.model");
const { default: mongoose } = require("mongoose");

exports.getCountriesData = async (req, res) => {
  try {
    const pipeline = [
      {
        $lookup: {
          from: "states",
          localField: "_id",
          foreignField: "country",
          as: "states",
          pipeline: [
            {
              $lookup: {
                from: "cities",
                localField: "_id",
                foreignField: "state",
                as: "cities",
              },
            },
          ],
        },
      },
    ];
    const countries = await countryModel.aggregate(pipeline);
    res.status(200).json({ success: true, countries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getCountries = async (req, res) => {
  try {
    const countries = await countryModel.find().select("_id name code");
    res.status(200).json({ success: true, countries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getStates = async (req, res) => {
  const { countryId } = req.params;
  try {
    const states = await stateModel
      .find({ country: countryId })
      .select("_id name country");
    res.status(200).json({ success: true, states });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getCities = async (req, res) => {
  const { stateId } = req.params;
  try {
    const cities = await cityModel
      .find({ state: stateId })
      .select("_id name state");
    res.status(200).json({ success: true, cities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};
