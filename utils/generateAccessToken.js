const jwt = require("jsonwebtoken");

const generateAccessToken = (id, role, email) => {
  const options = {};

  if (
    // process.env.NODE_ENV !== "development" &&
    process.env.JWT_ACCESS_EXPIRES_IN
  ) {
    options.expiresIn = process.env.JWT_ACCESS_EXPIRES_IN;
  }

  return jwt.sign({ id, role, email }, process.env.JWT_SECRET, options);
};

module.exports = generateAccessToken;
