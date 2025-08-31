const messages = require("../../messages/messages");
const User = require("../../models/user.model");
const { uploadFile } = require("../../utils/s3");
const bcrypt = require("bcrypt");

exports.editVendorProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      businessName,
      street,
      mobileNum,
      whatsappNum,
      landlineNum,
      fleetSize,
      mapUrl,
      status,
    } = req.body;

    // Find the user
    const userObj = await User.findById(req.user.id);
    if (!userObj) {
      return res
        .status(400)
        .json({ success: false, ...messages.AUTH_USER_NOT_FOUND });
    }

    const [country, state, city] = Promise.all([
      await Country.findById(req.body.country).select("name"),
      await State.findById(req.body.state).select("name"),
      await City.findById(req.body.city).select("name"),
    ]);

    if (!country || !state || !city) {
      return res.status(400).json({
        success: false,
        message: "Invalid location reference provided",
      });
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
    if (country) userObj.address["country"] = country?.name;
    if (city) userObj.address["city"] = city?.name;
    if (state) userObj.address["state"] = state?.name;
    if (street) userObj.address["street"] = street;
    if (mapUrl) userObj.address["mapUrl"] = mapUrl;
    if (whatsappNum) userObj.contact["whatsappNum"] = whatsappNum;
    if (landlineNum) userObj.contact["landlineNum"] = landlineNum;
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
