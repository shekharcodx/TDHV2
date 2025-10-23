const User = require("../../models/user.model");
const CustomerDetail = require("../../models/customer.model");
const messages = require("../../messages/messages");
const frontend = require("../../messages/frontend");
const { uploadFile } = require("../../utils/s3");
const { default: mongoose } = require("mongoose");

exports.completeProfile = async (req, res) => {
  try {
    const customer = await CustomerDetail.findOne({ userId: req.user.id });
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, ...messages.AUTH_USER_NOT_FOUND });
    }

    const customerDocs = { ...customer.documents };

    // Upload vendor documents
    const docFields = [
      "emiratesIdFront",
      "emiratesIdBack",
      "drivingLicenseFront",
      "drivingLicenseBack",
      "passport",
      "visa",
    ];

    if (req.files) {
      for (const field of docFields) {
        if (req.files[field]?.length) {
          const file = req.files[field][0];
          const fileBuffer = file.buffer;
          const fileName = file.originalname;

          const result = await uploadFile(
            fileBuffer,
            "customer_documents",
            fileName
          );

          customerDocs[field] = {
            key: result.key,
            filename: result.filename,
          };
        }
      }
    }

    customer.documents = customerDocs;
    await customer.save();

    res.status(201).json({ success: true, ...frontend.CUSTOMER_DETAILS_ADDED });
  } catch (err) {
    console.log("error completing profile", err);
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.editProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, ...messages.AUTH_USER_NOT_FOUND });
    }

    const [details] = await CustomerDetail.find({ userId: user._id }).select(
      "contact emiratesId licenseNum"
    );

    res.status(200).json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        phoneNum: details?.contact?.phoneNum,
        emiratesId: details?.emiratesId,
        licenseNum: details?.licenseNum,
        emirate: details?.contact?.emirate,
        address: details?.contact?.address,
      },
    });
  } catch (err) {
    console.log("Edit profile error", err);
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.updateProfile = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { name, phoneNum, emiratesId, licenseNum, emirate, address } =
      req.body;

    const user = await User.findById(req.user.id).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, ...messages.AUTH_USER_NOT_FOUND });
    }

    const userDetails = await CustomerDetail.findOne({
      userId: user._id,
    }).session(session);
    if (!userDetails) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, ...messages.AUTH_USER_NOT_FOUND });
    }

    if (name !== undefined) user.name = name;
    await user.save({ session });

    if (!userDetails.contact) userDetails.contact = {};

    if (phoneNum !== undefined) userDetails.contact.phoneNum = phoneNum;
    if (emirate !== undefined) userDetails.contact.emirate = emirate;
    if (address !== undefined) userDetails.contact.address = address;
    if (emiratesId !== undefined) userDetails.emiratesId = emiratesId;
    if (licenseNum !== undefined) userDetails.licenseNum = licenseNum;

    await userDetails.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      ...frontend.PROFILE_UPDATED,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    await session.abortTransaction();
    session.endSession();
    return res
      .status(500)
      .json({ success: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};

exports.getDocuemnts = async (req, res) => {
  try {
    const customer = await User.findById(req.user.id).select("_id");
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, ...messages.AUTH_USER_NOT_FOUND });
    }

    const [customerDetails] = await CustomerDetail.find({
      userId: customer._id,
    });

    res
      .status(200)
      .json({ success: true, data: customerDetails?.documents || {} });
  } catch (err) {
    console.log("Get Documents Err", err);
    return res
      .status(500)
      .json({ sucess: false, ...messages.INTERNAL_SERVER_ERROR });
  }
};
