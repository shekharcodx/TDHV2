const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../../models/user.model");
const VendorDetail = require("../../models/vendor.model");
const CustomerDetail = require("../../models/customer.model");
const RefreshToken = require("../../models/refreshToken.model");
const generateAccessToken = require("../../utils/generateAccessToken");
const jwt = require("jsonwebtoken");
const messages = require("../../messages/messages");
const uploadBufferToCloudinary = require("../../utils/uploadToClaudinary");
const deleteImage = require("../../utils/deleteImage");
const generateRandomPassword = require("../../utils/generatePassword");
const { sendEmailFromTemplate } = require("../../utils/sendEmail");
const { uploadFile } = require("../../utils/s3");
const { ACCOUNT_STATUS, USER_ROLES } = require("../../config/constants");
// const Country = require("../../models/locationModels/country.model");
// const State = require("../../models/locationModels/state.model");
// const City = require("../../models/locationModels/city.model");
const crypto = require("crypto");
const generateRefreshToken = require("../../utils/generateRefreshToken");

exports.register = async (req, res) => {
  let {
    name,
    email,
    role,
    password,
    businessName,
    street,
    mobileNum,
    whatsappNum,
    landlineNum,
    phoneNum,
    fleetSize,
    mapUrl,
  } = req.body;

  role = parseInt(role);

  if (![USER_ROLES.VENDOR, USER_ROLES.CUSTOMER].includes(role)) {
    return res
      .status(400)
      .json({ success: false, ...messages.AUTH_REGISTRAION_ROLE_INVALID });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let userExists = await User.findOne({ email });
    if (userExists)
      return res
        .status(400)
        .json({ success: false, ...messages.AUTH_USER_ALREADY_EXISTS });

    let status = ACCOUNT_STATUS.APPROVED;
    let profilePic = {};
    let vendorDocs = {};
    let customerDocs = {};

    // const [country, state, city] = await Promise.all([
    //   Country.findById(req.body.country).select("name"),
    //   State.findById(req.body.state).select("name"),
    //   City.findById(req.body.city).select("name"),
    // ]);

    // if (!country || !state || !city) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid location reference provided",
    //   });
    // }

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

          const result = await uploadFile(
            fileBuffer,
            "vendor_documents",
            fileName
          );

          vendorDocs[field] = {
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

      profilePic = {
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

    if (profilePic) {
      userData.profilePicture = profilePic;
    }
    if (role === USER_ROLES.VENDOR) {
      userData.temporaryPassword = true;
    }

    const user = await User.create([userData], { session });
    const createdUser = user[0];

    if (role === USER_ROLES.CUSTOMER) {
      const customerDetails = {
        userId: createdUser._id,
        contact: {
          phoneNum,
        },
      };

      await CustomerDetail.create([customerDetails], { session });
    }

    if (role === USER_ROLES.VENDOR) {
      const vendorDetails = {};
      vendorDetails.userId = createdUser._id;
      vendorDetails.businessName = businessName;
      vendorDetails.address = {
        street,
        country: req.body.country,
        city: req.body.city,
        state: req.body.state,
        mapUrl,
      };
      vendorDetails.contact = { whatsappNum, landlineNum, mobileNum };
      vendorDetails.temporaryPassword = true;
      vendorDetails.vendorInformation = {
        fleetSize: fleetSize,
        documents: vendorDocs,
      };

      await VendorDetail.create([vendorDetails], { session });
    }

    if (role === USER_ROLES.VENDOR) {
      try {
        await sendEmailFromTemplate("temporary_password", createdUser.email, {
          name: createdUser.name,
          tempPassword: password,
        });
      } catch (err) {
        console.log("Sending email error", err);
        await session.abortTransaction();
      }
    }

    let messageObj =
      role === USER_ROLES.VENDOR
        ? messages.AUTH_CHECK_EMAIL_FOR_TEMP_PASSWORD
        : messages.AUTH_REGISTRATION_SUCCESS;

    let info =
      role === USER_ROLES.CUSTOMER
        ? {
            token: generateAccessToken(
              createdUser._id,
              createdUser.role,
              createdUser.email
            ),
          }
        : null;

    await session.commitTransaction();

    const { refreshToken, refreshTokenName } = await getRefreshToken(
      createdUser
    );

    res
      .status(201)
      .cookie(refreshTokenName, refreshToken, cookieConfig())
      .json({
        success: true,
        ...messageObj,
        data: {
          _id: createdUser._id,
          name: createdUser.name,
          email: createdUser.email,
          role: createdUser.role,
          ...info,
        },
      });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
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

    const accessToken = generateAccessToken(user._id, user.role, user.email);

    const { refreshToken, refreshTokenName } = await getRefreshToken(user);

    res
      .status(200)
      .cookie(refreshTokenName, refreshToken, cookieConfig())
      .json({
        success: true,
        ...messages.AUTH_LOGIN_SUCCESS,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          token: accessToken,
          role: user.role,
          status: user.status,
          profilePicture: user.profilePicture?.url || null,
        },
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.refresh = async (req, res) => {
  try {
    const { role } = req.body;

    let refreshToken;
    if (role === USER_ROLES.ADMIN) refreshToken = req.cookies.adminRefreshToken;
    else if (role === USER_ROLES.VENDOR)
      refreshToken = req.cookies.vendorRefreshToken;
    else refreshToken = req.cookies.customerRefreshToken;

    if (!refreshToken)
      return res
        .status(401)
        .json({ success: false, message: "No refresh token" });

    const tokenDoc = await RefreshToken.findOne({ token: refreshToken });
    if (!tokenDoc)
      return res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
    }
    console.log("decoded refresh token:", decoded);

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive)
      return res.status(403).json({ success: false, message: "User inactive" });

    // Delete old refresh token
    // await RefreshToken.deleteOne({ _id: tokenDoc._id });

    // Generate new tokens
    // const newRefreshToken = await generateRefreshToken(
    //   user._id,
    //   user.role,
    //   user.email
    // );
    const accessToken = generateAccessToken(user._id, user.role, user.email);

    res.status(200).json({
      success: true,
      data: { id: user._id, email: user.email, token: accessToken },
    });
  } catch (err) {
    console.log("refresh token api error", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.logout = async (req, res) => {
  try {
    const { id } = req.user;
    const deleted = await RefreshToken.deleteOne({ userId: id });
    if (deleted.deletedCount === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No token found to delete" });
    }

    res
      .status(200)
      .clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
      })
      .json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.log("Logout api error", err);
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
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
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.forgetPassword = async (req, res) => {
  const { email, role } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, ...messages.AUTH_USER_NOT_FOUND });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const passwordResetExpires = Date.now() + 15 * 60 * 1000;

    // const resetToken = jwt.sign(
    //   {
    //     id: user._id,
    //   },
    //   process.env.JWT_RESET_SECRET,
    //   { expiresIn: "15m" }
    // );

    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = passwordResetExpires;

    await user.save();

    let resetLink = "";

    if (role && Number(role) == 1) {
      resetLink = `${process.env.RESET_LINK_ADMIN}${resetToken}`;
    } else if (role && Number(role) == 2) {
      resetLink = `${process.env.RESET_LINK_VENDOR}${resetToken}`;
    } else {
      resetLink = `${process.env.RESET_LINK_ADMIN}${resetToken}`;
    }

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

    // const result = validateJWT(token, process.env.JWT_RESET_SECRET);
    const incomingHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: incomingHash,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, ...messages.AUTH_INVALID_RESET_TOKEN });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
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
  const { id, role } = req.user;
  try {
    const user = await User.findById(id)
      .select("-password -createdAt -updatedAt")
      .populate("profilePicture");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, ...messages.AUTH_USER_NOT_FOUND });
    }

    let vendorDetails = null;
    if (role == USER_ROLES.VENDOR) {
      vendorDetails = await VendorDetail.findOne({ userId: user._id });
    }
    let customerDetails = null;
    if (role == USER_ROLES.CUSTOMER) {
      customerDetails = await CustomerDetail.findOne({
        userId: user._id,
      });
    }

    let userObj = {};
    switch (user.role) {
      case USER_ROLES.ADMIN:
        userObj = {
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          contact: user.contact,
          isActive: user.isActive,
          token: generateAccessToken(user._id, user.role, user.email),
          profilePicture: user.profilePicture.url || null,
        };
        break;
      case USER_ROLES.VENDOR:
        userObj = {
          _id: user._id,
          name: user.name,
          email: user.email,
          businessName: vendorDetails?.businessName,
          address: vendorDetails?.address,
          contact: vendorDetails?.contact,
          vendorInformation: vendorDetails?.vendorInformation,
          token: generateAccessToken(user._id, user.role, user.email),
          role: user.role,
          status: user.status,
          profilePicture: user.profilePicture.url || null,
          isActive: user.isActive,
        };
        break;
      case USER_ROLES.CUSTOMER:
        userObj = {
          _id: user._id,
          name: user.name,
          email: user.email,
          contact: customerDetails?.contact,
          documents: customerDetails?.documents,
          profileComplete:
            Object.entries(customerDetails?.documents)?.length >= 6,
          token: generateAccessToken(user._id, user.role, user.email),
          role: user.role,
          status: user.status,
          profilePicture: user.profilePicture.url || null,
          isActive: user.isActive,
        };
        break;
    }

    res.json({
      success: true,
      ...messages.USER_FOUND,
      data: userObj,
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
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { newPassword, currentPassword } = req.body;
    const user = await User.findById(req.user.id).select("email name password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, ...messages.AUTH_USER_NOT_FOUND });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, ...messages.AUTH_INVALID_PASSWORD });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    await sendEmailFromTemplate("password_changed", user.email, {
      name: user.name,
    });

    res.json({ success: true, ...messages.AUTH_PASSWORD_UPDATED });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

const getRefreshToken = async (user) => {
  await RefreshToken.deleteOne({ userId: user._id });
  const refreshToken = await generateRefreshToken(
    user._id,
    user.role,
    user.email
  );

  let refreshTokenName = "";

  if (user.role === USER_ROLES.ADMIN) {
    refreshTokenName = "adminRefreshToken";
  } else if (user.role === USER_ROLES.VENDOR) {
    refreshTokenName = "vendorRefreshToken";
  } else {
    refreshTokenName = "customerRefreshToken";
  }

  return { refreshToken, refreshTokenName };
};

const cookieConfig = () => {
  const config = {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  return config;
};
