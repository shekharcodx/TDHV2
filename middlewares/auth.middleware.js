const messages = require("../messages/messages");
const User = require("../models/user.model");
const { validateJWT } = require("../utils/verifyToken");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const result = validateJWT(token, process.env.JWT_SECRET);

      if (!result?.valid || result?.expired) {
        return res
          .status(401)
          .json({ success: false, ...messages.AUTH_INVALID_RESET_TOKEN });
      }

      const user = await User.findById(result?.decoded?.id);
      if (!user.isActive)
        return res
          .status(403)
          .json({ success: false, ...messages.ACCOUNT_DEACTIVATED });

      req.user = result?.decoded;
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
