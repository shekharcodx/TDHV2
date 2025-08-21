const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const generateToken = require("../utils/generateToken");
const jwt = require("jsonwebtoken");
const messages = require("../messages/messages");
const uploadBufferToCloudinary = require("../utils/uploadToClaudinary");
const deleteImage = require("../utils/deleteImage");
const generateRandomPassword = require("../utils/generatePassword");
const { sendEmailFromTemplate } = require("../utils/sendEmail");
const { uploadFile } = require("../utils/s3");
const { validateJWT } = require("../utils/verifyToken");
const { ACCOUNT_STATUS, USER_ROLES } = require("../utils/constants");

exports.register = async (req, res) => {
  let {
    name,
    email,
    role,
    password,
    businessName,
    address,
    contact,
    vendorInformation,
  } = req.body;

  role = parseInt(role);

  if (![USER_ROLES.VENDOR, USER_ROLES.CUSTOMER].includes(role)) {
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

    let status = ACCOUNT_STATUS.APPROVED;
    let documents = {};

    if (role === USER_ROLES.VENDOR) {
      status = ACCOUNT_STATUS.PENDING;
      password = generateRandomPassword(10);

      // Upload vendor documents
      const docFields = [
        "ijariCertificate",
        "tradeLicense",
        "vatCertificate",
        "noc",
        "emiratesId",
        "poa",
      ];

      for (const field of docFields) {
        if (req.files && req.files[field]) {
          const file = req.files[field][0];
          const fileBuffer = file.buffer;
          const fileName = file.originalname;
          // const result = await uploadBufferToCloudinary(
          //   fileBuffer,
          //   "vendor_documents"
          // );

          const result = await uploadFile(
            fileBuffer,
            "vendor_documents",
            fileName
          );

          documents[field] = {
            key: result.key,
            filename: result.filename,
          };
        }
      }
    }

    // Upload profile picture if present
    if (req.files && req.files["profilePicture"]) {
      const file = req.files["profilePicture"][0];
      const fileBuffer = file.buffer;
      const fileName = file.originalname;

      const result = await uploadFile(fileBuffer, "profile_pictures", fileName);

      documents["profilePicture"] = {
        url: result.url,
        key: result.key,
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare user data for DB
    const userData = {
      name,
      email,
      password: hashedPassword,
      role,
      status,
    };

    if (role === USER_ROLES.VENDOR) {
      userData.businessName = businessName;
      userData.address = address;
      userData.contact = contact;
      userData.temporaryPassword = true;
      userData.vendorInformation = {
        fleetSize: vendorInformation?.fleetSize,
        documents,
      };
    }

    if (documents.profilePicture) {
      userData.profilePicture = documents.profilePicture;
    }

    const user = await User.create(userData);

    await sendEmailFromTemplate("temporary_password", user.email, {
      name: user.name,
      tempPassword: password,
    });

    let messageObj =
      role === USER_ROLES.VENDOR
        ? messages.AUTH_CHECK_EMAIL_FOR_TEMP_PASSWORD
        : messages.AUTH_REGISTRATION_SUCCESS;

    let info =
      role === USER_ROLES.CUSTOMER
        ? { token: generateToken(user._id, user.role, user.email) }
        : null;

    res.status(201).json({
      success: true,
      ...messageObj,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...info,
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

    if (!user.isActive) {
      return res
        .status(403)
        .json({ success: false, ...messages.ACCOUNT_DEACTIVATED });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, ...messages.AUTH_INVALID_CREDENTIALS });
    }

    if (user.temporaryPassword) {
      return res
        .status(403)
        .json({ success: false, ...messages.AUTH_VENDOR_CREATE_NEW_PASSWORD });
    }

    res.json({
      success: true,
      ...messages.AUTH_LOGIN_SUCCESS,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id, user.role, user.email),
        role: user.role,
        status: user.status,
        profilePicture: user.profilePicture?.url || null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createNewPassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, ...messages.AUTH_USER_NOT_FOUND });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, ...messages.AUTH_INVALID_PASSWORD });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.temporaryPassword = false;
    await user.save();

    res.json({ success: true, ...messages.AUTH_PASSWORD_CHANGED });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, ...messages.AUTH_USER_NOT_FOUND });
    }

    const resetToken = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_RESET_SECRET,
      { expiresIn: "15m" }
    );

    const resetLink = `${process.env.RESET_LINK}${resetToken}`;
    await sendEmailFromTemplate("password_reset", user.email, {
      name: user.name,
      resetLink,
    });

    res.status(200).json({ success: true, ...messages.RESET_LINK_SENT });
  } catch (err) {
    console.log("Error in forgetPassword:", err);
    res.status(500).json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    if (!token) {
      return res
        .status(400)
        .json({ success: false, ...messages.AUTH_RESET_TOKEN_REQUIRED });
    }

    const result = validateJWT(token, process.env.JWT_RESET_SECRET);

    if (!result?.valid || result?.expired) {
      return res
        .status(400)
        .json({ success: false, ...messages.AUTH_INVALID_RESET_TOKEN });
    }

    const user = await User.findById(result?.decoded?.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, ...messages.AUTH_USER_NOT_FOUND });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = null;
    await user.save();

    await sendEmailFromTemplate("password_changed", user.email, {
      name: user.name,
    });

    res.status(200).json({
      success: true,
      ...messages.AUTH_PASSWORD_RESET_SUCCESS,
    });
  } catch (err) {
    console.error("Error in resetPassword:", err);
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getCurrentLoggedInUser = async (req, res) => {
  const { id } = req.user;
  try {
    const user = await User.findById(id).populate("profilePicture");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, ...messages.AUTH_USER_NOT_FOUND });
    }

    res.json({
      success: true,
      ...messages.USER_FOUND,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        businessName: user.businessName,
        address: user.address,
        contact: user.contact,
        vendorInformation: user.vendorInformation,
        token: generateToken(user._id, user.role, user.email),
        role: user.role,
        status: user.status,
        profilePicture: user.profilePicture.url || null,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
