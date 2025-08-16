const User = require("../../models/user.model");
const Country = require("../../models/country.model");
const State = require("../../models/state.model");
const City = require("../../models/city.model");
const messages = require("../../messages/messages");
const adminMessages = require("../../messages/admin");
const { ACCOUNT_STATUS, USER_ROLES } = require("../../utils/constants");

exports.updateAccountStatus = async (req, res) => {
  const { id, status } = req.body;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, ...messages.AUTH_USER_NOT_FOUND });
    }

    let message;

    const statusNum = Number(status);

    switch (statusNum) {
      case 2:
        message = adminMessages.USER_APPROVED;
        break;
      case 3:
        message = adminMessages.USER_ON_HOLD;
        break;
      case 4:
        message = adminMessages.USER_BLOCKED;
        break;
      default:
        message = adminMessages.USER_PENDING;
    }

    user.status = statusNum;
    await user.save();

    res.status(200).json({ success: true, ...message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getAllVendors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const options = {
      page,
      limit,
      sort: { createdAt: -1 },
      select: "-password",
    };

    const vendors = await User.paginate({ role: USER_ROLES.VENDOR }, options);
    res.status(200).json({ success: true, vendors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getPendingVendors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const options = {
      page,
      limit,
      sort: { createdAt: -1 },
      select: "-password",
    };

    const pendingVendors = await User.paginate(
      {
        role: USER_ROLES.VENDOR,
        status: ACCOUNT_STATUS.PENDING,
      },
      options
    );

    res.status(200).json({ success: true, pendingVendors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const options = {
      page,
      limit,
      sort: { createdAt: -1 },
      select: "-password",
    };

    const customers = await User.paginate(
      { role: USER_ROLES.CUSTOMER },
      options
    );
    res.status(200).json({ success: true, customers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

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

    // const states = await State.insertMany(
    //   stateNames.map((name) => ({ name, country: countryId }))
    // );

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
    // const cities = City.insertMany(
    //   cityNames.map((name) => ({ name, state: stateId }))
    // );

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
