const express = require("express");
const router = express.Router();
const {
  createAdmin,
  getAllAdmins,
  updateIsUserActive,
  updateAccountStatus,
  getAllVendors,
  getPendingVendors,
  getAllCustomers,
  getDocuments,
  editVendorProfile,
  getUser,
  editCurrentAdminProfile,
} = require("../../controllers/admin/user.controller");
const {
  createAdminValidation,
  updateIsActiveValidation,
  updateAccountStatusValidation: accountStatusValidate,
  getDocumentsValidate,
  editVendorProfileValidation,
  getUserValidation,
  editCurrentAdminProfileValidate,
} = require("../../validations/admin/user.validation");

const cpUpload = require("../../middlewares/registerFiles.middleware");

const validate = require("../../middlewares/validate.middleware");
const upload = require("../../middlewares/upload.middleware");

router.put(
  "/accountStatus",
  accountStatusValidate,
  validate,
  updateAccountStatus
);

router.post("/admin", createAdminValidation, validate, createAdmin);

router.get("/admins", getAllAdmins);

router.put(
  "/profileActiveStatus",
  updateIsActiveValidation,
  validate,
  updateIsUserActive
);

router.get("/vendors", getAllVendors);

router.get("/pendingVendors", getPendingVendors);

router.get("/customers", getAllCustomers);

router.get("/document", getDocumentsValidate, validate, getDocuments);

router.get("/user/:userId", getUserValidation, validate, getUser);

router.put(
  "/editVendorProfile",
  cpUpload,
  editVendorProfileValidation,
  validate,
  editVendorProfile
);

router.put(
  "/adminProfile",
  upload.single("profilePicture"),
  editCurrentAdminProfileValidate,
  validate,
  editCurrentAdminProfile
);

module.exports = router;
