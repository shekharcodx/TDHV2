const jwt = require("jsonwebtoken");
const messages = require("../messages/messages");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // req.user = await User.findById(decoded.id).select("-password");
      req.user = decoded;
      return next();
    } catch (error) {
      return res
        .status(401)
        .json({ success: false, message: messages.NOT_AUTHORIZED });
    }
  }

  return res
    .status(401)
    .json({ success: false, message: messages.NOT_AUTHORIZED_NO_TOKEN });
};

module.exports = protect;
