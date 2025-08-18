const messages = require("../../messages/messages");
const countryModel = require("../../models/country.model");
const stateModel = require("../../models/state.model");
const cityModel = require("../../models/city.model");
const { default: mongoose } = require("mongoose");

exports.getCountriesData = async (req, res) => {
  try {
    const pipeline = [
      {
        $match: { isActive: true }, // ✅ only active countries
      },
      {
        $lookup: {
          from: "states",
          let: { countryId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$country", "$$countryId"] },
                    { $eq: ["$isActive", true] }, // ✅ only active states
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "cities",
                let: { stateId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$state", "$$stateId"] },
                          { $eq: ["$isActive", true] }, // ✅ only active cities
                        ],
                      },
                    },
                  },
                ],
                as: "cities",
              },
            },
          ],
          as: "states",
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
    const countries = await countryModel
      .find({ isActive: true })
      .select("_id name code");
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
      .find({ country: countryId, isActive: true })
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
      .find({ state: stateId, isActive: true })
      .select("_id name state");
    res.status(200).json({ success: true, cities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};
