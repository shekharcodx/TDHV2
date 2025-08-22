const messages = require("../messages/messages");
const User = require("../models/user.model");
const { ACCOUNT_STATUS } = require("../config/constants");

const checkIsApproved = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("status");
    if (!user || user.status !== ACCOUNT_STATUS.APPROVED) {
      const msg = !user
        ? messages.AUTH_USER_NOT_FOUND
        : messages.ACCOUNT_NOT_APPROVED;
      return res.status(403).json({ success: false, ...msg });
    }

    return next();
  } catch (err) {
    console.error("checkIsApproved error:", err);
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

module.exports = checkIsApproved;
