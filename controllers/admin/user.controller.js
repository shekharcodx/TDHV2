const User = require("../../models/user.model");
const messages = require("../../messages/messages");
const adminMessages = require("../../messages/admin");
const bcrypt = require("bcrypt");
const { ACCOUNT_STATUS, USER_ROLES } = require("../../utils/constants");
const generateToken = require("../../utils/generateToken");
const { getFile, uploadFile } = require("../../utils/s3");
const mime = require("mime-types");

exports.updateAccountStatus = async (req, res) => {
  const { id, status } = req.body;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, ...messages.AUTH_USER_NOT_FOUND });
    }

    if (user.email === process.env.ADMIN_EMAIL) {
      return res.status(403).json({
        success: false,
        ...messages.NOT_ALLOWED_TO_PERFORM_THIS_OPERATION,
      });
    }

    let message;

    const statusNum = Number(status);

    switch (statusNum) {
      case 2:
        message = adminMessages.USER_APPROVED;
        break;
      case 3:
        message = adminMessages.USER_ON_HOLD;
        break;
      case 4:
        message = adminMessages.USER_BLOCKED;
        break;
      default:
        message = adminMessages.USER_PENDING;
    }

    user.status = statusNum;
    await user.save();

    res.status(200).json({ success: true, ...message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.createAdmin = async (req, res) => {
  let { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, ...adminMessages.ADMIN_ALREADY_EXISTS });
    }

    const admin = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: USER_ROLES.ADMIN,
      status: ACCOUNT_STATUS.APPROVED,
    });

    res.status(200).json({
      success: true,
      ...adminMessages.ADMIN_CREATED,
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        token: generateToken(admin._id, admin.role, admin.email),
        role: admin.role,
        isActive: admin.isActive,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({
      role: USER_ROLES.ADMIN,
      _id: { $ne: req.user._id },
      email: { $ne: process.env.ADMIN_EMAIL },
    }).select("_id name email role isActive");

    res.status(200).json({ success: true, data: admins });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.updateIsUserActive = async (req, res) => {
  const { userId, isActive } = req.body;
  try {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, ...messages.AUTH_USER_NOT_FOUND });
    }

    if (user.email === process.env.ADMIN_EMAIL) {
      return res.status(403).json({
        success: false,
        ...messages.NOT_ALLOWED_TO_PERFORM_THIS_OPERATION,
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { isActive } },
      { new: true }
    );
    res.status(200).json({
      success: true,
      ...messages.USER_UPDATED,
      data: {
        name: updatedUser.name,
        email: updatedUser.email,
        isActive: updatedUser.isActive,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getAllVendors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const options = {
      page,
      limit,
      sort: { createdAt: -1 },
      select: "-password",
    };

    const vendors = await User.paginate({ role: USER_ROLES.VENDOR }, options);
    res.status(200).json({ success: true, vendors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getPendingVendors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const options = {
      page,
      limit,
      sort: { createdAt: -1 },
      select: "-password",
    };

    const pendingVendors = await User.paginate(
      {
        role: USER_ROLES.VENDOR,
        status: ACCOUNT_STATUS.PENDING,
      },
      options
    );

    res.status(200).json({ success: true, pendingVendors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const options = {
      page,
      limit,
      sort: { createdAt: -1 },
      select: "-password",
    };

    const customers = await User.paginate(
      { role: USER_ROLES.CUSTOMER },
      options
    );
    res.status(200).json({ success: true, customers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getDocuments = async (req, res) => {
  const { documentKey } = req.query;
  try {
    const file = await getFile(documentKey);

    if (!file) {
      return res
        .status(404)
        .json({ success: false, ...adminMessages.RESOURCE_NOT_FOUND });
    }

    const contentType =
      file.contentType ||
      mime.lookup(file.fileName) ||
      "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `inline; filename="${file.fileName}"`);

    res.send(file.buffer);
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.editVendorProfile = async (req, res) => {
  let {
    name,
    email,
    role,
    password,
    businessName,
    address,
    contact,
    vendorInformation,
    status,
  } = req.body;

  role = parseInt(role);

  if (2 !== role) {
    return res
      .status(400)
      .json({ success: false, ...messages.AUTH_REGISTRAION_ROLE_INVALID });
  }

  try {
    let userObj = await User.findOne({ email });
    if (!userObj)
      return res
        .status(400)
        .json({ success: false, ...messages.AUTH_USER_NOT_FOUND });

    let documents = {};

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
          fileName,
          userObj.vendorInformation?.documents?.[field]?.key
        );

        documents[field] = {
          key: result.key,
          filename: result.filename,
        };
      }
    }

    // Upload profile picture if present
    let profilePictureData = null;
    if (req.files && req.files["profilePicture"]) {
      const file = req.files["profilePicture"][0];
      const result = await uploadFile(
        file.buffer,
        "profile_pictures",
        file.originalname,
        userObj?.profilePicture?.key
      );
      profilePictureData = {
        url: result.url,
        key: result.key,
      };
    }

    // Prepare user data for DB
    const userData = {
      name,
      email,
      password: password ? await bcrypt.hash(password, 10) : userObj.password,
      role,
      status,
      businessName,
      address,
      contact,
      vendorInformation: {
        fleetSize: vendorInformation?.fleetSize,
        documents,
      },
    };

    if (documents.profilePicture) {
      userData.profilePicture = documents.profilePicture;
    }

    Object.assign(userObj, userData);

    await userObj.save();

    // await sendEmailFromTemplate("temporary_password", user.email, {
    //   name: user.name,
    //   tempPassword: password,
    // });

    res.status(201).json({
      success: true,
      ...messages.PROFILE_UPDATED,
      data: {
        _id: userObj._id,
        name: userObj.name,
        email: userObj.email,
        role: userObj.role,
        profilePicture: userObj.profilePicture,
        documents: userObj.vendorInformation.documents,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
