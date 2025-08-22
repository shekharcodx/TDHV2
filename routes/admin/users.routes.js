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
  "/updateAccountStatus",
  accountStatusValidate,
  validate,
  updateAccountStatus
);

router.post("/createAdmin", createAdminValidation, validate, createAdmin);

router.get("/getAllAdmins", getAllAdmins);

router.put(
  "/updateIsUserActive",
  updateIsActiveValidation,
  validate,
  updateIsUserActive
);

router.get("/getAllVendors", getAllVendors);

router.get("/getPendingVendors", getPendingVendors);

router.get("/getAllCustomers", getAllCustomers);

router.get("/getDocument", getDocumentsValidate, validate, getDocuments);

router.get("/getUser/:userId", getUserValidation, validate, getUser);

router.put(
  "/editVendorProfile",
  cpUpload,
  editVendorProfileValidation,
  validate,
  editVendorProfile
);

router.put(
  "/editCurrentAdminProfile",
  upload.single("profilePicture"),
  editCurrentAdminProfileValidate,
  validate,
  editCurrentAdminProfile
);

module.exports = router;
