const jwt = require("jsonwebtoken");

exports.validateJWT = (token, secret) => {
  try {
    const decoded = jwt.verify(token, secret);
    return { valid: true, expired: false, decoded };
  } catch (err) {
    return {
      valid: false,
      expired: err.message === "jwt expired",
      decoded: null,
      error: err.message,
    };
  }
};
