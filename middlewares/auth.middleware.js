const jwt = require("jsonwebtoken");
const messages = require("../messages/messages");
const User = require("../models/user.model");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id);
      if (!user.isActive)
        return res
          .status(403)
          .json({ success: false, ...messages.ACCOUNT_DEACTIVATED });

      req.user = decoded;
      return next();
    } catch (error) {
      return res
        .status(401)
        .json({ success: false, ...messages.NOT_AUTHORIZED });
    }
  }

  return res
    .status(401)
    .json({ success: false, ...messages.NOT_AUTHORIZED_NO_TOKEN });
};

module.exports = protect;
