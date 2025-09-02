const User = require("../../models/user.model");
const messages = require("../../messages/messages");
const adminMessages = require("../../messages/admin");
const bcrypt = require("bcrypt");
const { ACCOUNT_STATUS, USER_ROLES } = require("../../config/constants");
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

exports.editCurrentAdminProfile = async (req, res) => {
  const { name, password } = req.body;
  try {
    const admin = await User.findById(req.user.id);
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, ...messages.AUTH_USER_NOT_FOUND });
    }

    if (name) admin.name = name;
    if (password) admin.password = await bcrypt.hash(password, 10);

    if (req.file && req.file.mimetype.startsWith("image/")) {
      const file = req.file;
      const result = await uploadFile(
        file.buffer,
        "profile_pictures",
        file.originalname,
        admin?.profilePicture?.key
      );
      admin.profilePicture = {
        url: result.url,
        key: result.key,
      };
    }

    await admin.save();

    res.status(200).json({
      success: true,
      ...messages.USER_UPDATED,
      data: {
        id: admin._id,
        name: admin.name,
        profilePicture: admin.profilePicture,
      },
    });
  } catch (err) {
    console.log("error editing admin", err);
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getAllAdmins = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const options = {
    page,
    limit,
    sort: { createdAt: -1 },
    select: "_id name email role isActive",
  };

  try {
    const admins = await User.paginate(
      {
        role: USER_ROLES.ADMIN,
        _id: { $ne: req.user._id },
        email: { $ne: process.env.ADMIN_EMAIL },
      },
      options
    );

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
    const { status, isActive, search } = req.query;

    console.log("searchString", search);

    let filter = { role: USER_ROLES.VENDOR };

    if (search) {
      const safeSearch = escapeRegex(search.trim());

      filter = {
        role: USER_ROLES.VENDOR,
        $or: [
          { name: { $regex: safeSearch, $options: "i" } },
          { email: { $regex: safeSearch, $options: "i" } },
        ],
      };
    } else {
      if (status) {
        filter.status = parseInt(status);
      }
      if (isActive) {
        filter.isActive = isActive === "true";
      }
    }

    const options = {
      page,
      limit,
      sort: { createdAt: -1 },
      select: "-password",
    };

    const vendors = await User.paginate(filter, options);

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

// exports.getUser = async (req, res) => {
//   const { userId } = req.params;
//   try {
//     const user = await User.findById(userId).select("-createdAt -updatedAt");

//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, ...messages.AUTH_USER_NOT_FOUND });
//     }

//     res.status(200).json({ success: true, data: user });
//   } catch (err) {
//     console.log("User fetching err", err);
//     return res
//       .status(500)
//       .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
//   }
// };

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

exports.getUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).select(
      "-createdAt -updatedAt -password"
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, ...messages.AUTH_USER_NOT_FOUND });
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.log("User fetching err", err);
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.editVendorProfile = async (req, res) => {
  try {
    const {
      vendorId,
      name,
      email,
      password,
      businessName,
      street,
      country,
      city,
      state,
      mobileNum,
      whatsappNum,
      landlineNum,
      fleetSize,
      mapUrl,
      status,
    } = req.body;

    // Find the user
    const userObj = await User.findById(vendorId);
    if (!userObj) {
      return res
        .status(400)
        .json({ success: false, ...messages.AUTH_USER_NOT_FOUND });
    }

    // Prevent editing super admin if needed
    if (userObj.role === 1) {
      return res.status(403).json({
        success: false,
        ...messages.NOT_ALLOWED_TO_PERFORM_THIS_OPERATION,
      });
    }

    // Check email uniqueness
    if (email) {
      const userExists = await User.findOne({ email });
      if (userExists && userExists._id.toString() !== userObj._id.toString()) {
        return res
          .status(403)
          .json({ success: false, ...messages.AUTH_USER_ALREADY_EXISTS });
      }
    }

    const documents = {};

    // Upload only newly uploaded files
    const docFields = [
      "ijariCertificate",
      "tradeLicense",
      "vatCertificate",
      "noc",
      "emiratesId",
      "poa",
    ];

    // Only include uploaded files
    for (const field of docFields) {
      if (req.files && req.files[field] && req.files[field][0]) {
        const file = req.files[field][0];
        const previousKey = userObj.vendorInformation?.documents?.[field]?.key;

        const result = await uploadFile(
          file.buffer,
          "vendor_documents",
          file.originalname,
          previousKey
        );

        documents[field] = {
          key: result.key,
          filename: result.filename,
        };
      }
    }

    // Update only uploaded fields
    if (!userObj.vendorInformation.documents)
      userObj.vendorInformation.documents = {};
    for (const field of Object.keys(documents)) {
      userObj.vendorInformation.documents[field] = documents[field];
    }

    // Handle profile picture
    if (req.files && req.files["profilePicture"]) {
      const file = req.files["profilePicture"][0];
      const result = await uploadFile(
        file.buffer,
        "profile_pictures",
        file.originalname,
        userObj?.profilePicture?.key
      );
      userObj.profilePicture = {
        url: result.url,
        key: result.key,
      };
    }

    // Update optional fields safely
    if (name) userObj.name = name;
    if (email) userObj.email = email;
    if (password) userObj.password = await bcrypt.hash(password, 10);
    if (status !== undefined) userObj.status = status;
    if (businessName) userObj.businessName = businessName;
    if (country) userObj.address["country"] = country;
    if (state) userObj.address["state"] = state;
    if (city) userObj.address["city"] = city;
    if (street) userObj.address["street"] = street;
    if (mapUrl) userObj.address["mapUrl"] = mapUrl;
    if (landlineNum) userObj.contact["landlineNum"] = landlineNum;
    if (whatsappNum) userObj.contact["whatsappNum"] = whatsappNum;
    if (mobileNum) userObj.contact["mobileNum"] = mobileNum;
    if (fleetSize) userObj.vendorInformation.fleetSize = fleetSize;

    // Save the user
    await userObj.save();

    res.status(200).json({
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
    console.error(error);
    res.status(500).json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
