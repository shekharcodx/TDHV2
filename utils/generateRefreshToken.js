const jwt = require("jsonwebtoken");
const ms = require("ms");
const RefreshToken = require("../models/refreshToken.model");

const generateRefreshToken = async (id, role, email) => {
  const options = {};

  if (
    // process.env.NODE_ENV !== "development" &&
    process.env.JWT_REFRESH_EXPIRES_IN
  ) {
    options.expiresIn = process.env.JWT_REFRESH_EXPIRES_IN;
  }

  const refreshToken = jwt.sign(
    { id, role, email },
    process.env.JWT_REFRESH_SECRET,
    options
  );

  await RefreshToken.create({
    token: refreshToken,
    userId: id,
    expiresAt: new Date(Date.now() + ms(process.env.JWT_REFRESH_EXPIRES_IN)),
  });

  return refreshToken;
};

module.exports = generateRefreshToken;
