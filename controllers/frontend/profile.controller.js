const User = require("../../models/user.model");
const CustomerDetail = require("../../models/customer.model");
const messages = require("../../messages/messages");
const frontend = require("../../messages/frontend");
const { uploadFile } = require("../../utils/s3");

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
