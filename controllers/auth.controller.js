const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const generateToken = require("../utils/generateToken");
const messages = require("../messages/messages");
const uploadBufferToCloudinary = require("../utils/uploadToClaudinary");
const deleteImage = require("../utils/deleteImage");
const { accountStatus } = require("../utils/constants");

exports.register = async (req, res) => {
  const { name, email, role, password } = req.body;
  role = parseInt(role);

  if (![2, 3].includes(role)) {
    return res
      .status(400)
      .json({ success: false, ...messages.AUTH_REGISTRAION_ROLE_INVALID });
  }

  try {
    let userExists = await User.findOne({ email });
    if (userExists)
      return res
        .status(400)
        .json({ success: false, ...messages.AUTH_USER_ALREADY_EXISTS });

    let profilePictureData = null;
    if (req.file) {
      const result = await uploadBufferToCloudinary(
        req.file.buffer,
        "profile_pictures"
      );
      profilePictureData = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    let status = "approved";
    if (role === 2) status = "pending";

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      status: accountStatus[status],
      profilePicture: profilePictureData,
    });

    let messageObj =
      role === 2
        ? messages.AUTH_REGISTRATION_APPROVAL_PENDING
        : messages.AUTH_REGISTRATION_SUCCESS;

    let info =
      role === 3 ? { token: generateToken(user._id, user.role) } : null;

    res.status(201).json({
      success: true,
      ...messageObj,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        ...info,
        profilePicture: user.profilePicture?.url || null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  let { email, password } = req.body;
  email = email.toLowerCase();

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, ...messages.AUTH_INVALID_CREDENTIALS });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, ...messages.AUTH_INVALID_CREDENTIALS });
    }

    // Block vendors with pending approval
    if (user.role === 2 && user.status === accountStatus.pending) {
      return res
        .status(403)
        .json({ success: false, ...messages.AUTH_VENDOR_PENDING_APPROVAL });
    }

    res.json({
      success: true,
      ...messages.AUTH_LOGIN_SUCCESS,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id, user.role),
        role: user.role,
        profilePicture: user.profilePicture?.url || null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, ...messages.AUTH_USER_NOT_FOUND });
    }

    if (req.body.name) user.name = req.body.name;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    if (req.file) {
      if (user?.profilePicture?.public_id) {
        await deleteImage(user.profilePicture.public_id);
      }

      const result = await uploadBufferToCloudinary(
        req.file.buffer,
        "profile_pictures"
      );
      user.profilePicture = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    await user.save();

    res.json({
      success: true,
      message: messages.PROFILE_UPDATED,
      data: {
        name: user.name,
        role: user.role,
        profilePicture: user.profilePicture?.url || null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
