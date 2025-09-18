const messages = require("../../messages/messages");
const mongoose = require("mongoose");
const User = require("../../models/user.model");
const { uploadFile } = require("../../utils/s3");
const bcrypt = require("bcrypt");
const Country = require("../../models/locationModels/country.model");
const State = require("../../models/locationModels/state.model");
const City = require("../../models/locationModels/city.model");
const VendorDetail = require("../../models/vendor.model");
const { USER_ROLES } = require("../../config/constants");

exports.editVendorProfile = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
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
    const userObj = await User.findById(req.user.id).session(session);
    if (!userObj) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ success: false, ...messages.AUTH_USER_NOT_FOUND });
    }

    const vendorDetails = await VendorDetail.findOne({
      userId: userObj._id,
    }).session(session);

    // Prevent editing super admin if needed
    if (userObj.role === USER_ROLES.ADMIN) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        ...messages.NOT_ALLOWED_TO_PERFORM_THIS_OPERATION,
      });
    }

    // Check email uniqueness
    if (email) {
      const userExists = await User.findOne({ email }).session(session);
      if (userExists && userExists._id.toString() !== userObj._id.toString()) {
        await session.abortTransaction();
        return res
          .status(403)
          .json({ success: false, ...messages.AUTH_USER_ALREADY_EXISTS });
      }
    }

    const documents = {};

    // Upload only newly uploaded vendor docs
    const docFields = [
      "ijariCertificate",
      "tradeLicense",
      "vatCertificate",
      "noc",
      "emiratesId",
      "poa",
    ];

    for (const field of docFields) {
      if (req.files && req.files[field] && req.files[field][0]) {
        const file = req.files[field][0];
        const previousKey =
          vendorDetails?.vendorInformation?.documents?.[field]?.key;

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

    // Ensure nested objects exist
    if (!vendorDetails.address) vendorDetails.address = {};
    if (!vendorDetails.contact) vendorDetails.contact = {};
    if (!vendorDetails.vendorInformation) vendorDetails.vendorInformation = {};
    if (!vendorDetails.vendorInformation.documents)
      vendorDetails.vendorInformation.documents = {};

    // Merge uploaded docs
    for (const field of Object.keys(documents)) {
      vendorDetails.vendorInformation.documents[field] = documents[field];
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

    // Update user fields
    if (name) userObj.name = name;
    if (email) userObj.email = email;
    if (password) userObj.password = await bcrypt.hash(password, 10);
    if (status !== undefined) userObj.status = status;

    // Update vendor fields
    if (country) vendorDetails.address.country = country;
    if (state) vendorDetails.address.state = state;
    if (city) vendorDetails.address.city = city;

    if (businessName) vendorDetails.businessName = businessName;
    if (street) vendorDetails.address.street = street;
    if (mapUrl) vendorDetails.address.mapUrl = mapUrl;
    if (whatsappNum) vendorDetails.contact.whatsappNum = whatsappNum;
    if (landlineNum) vendorDetails.contact.landlineNum = landlineNum;
    if (mobileNum) vendorDetails.contact.mobileNum = mobileNum;
    if (fleetSize) vendorDetails.vendorInformation.fleetSize = fleetSize;

    // Save both in transaction
    await userObj.save({ session });
    await vendorDetails.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      ...messages.PROFILE_UPDATED,
      data: {
        _id: userObj._id,
        name: userObj.name,
        email: userObj.email,
        role: userObj.role,
        profilePicture: userObj.profilePicture,
        businessName: vendorDetails.businessName,
        vendorInformation: vendorDetails.vendorInformation, // ✅ correct path
      },
    });
  } catch (error) {
    console.error(error);
    await session.abortTransaction();
    res.status(500).json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  } finally {
    session.endSession();
  }
};
