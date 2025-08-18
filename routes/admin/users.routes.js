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
} = require("../../controllers/admin/user.controller");
const {
  createAdminValidation,
  updateIsActiveValidation,
  updateAccountStatusValidation: accountStatusValidate,
} = require("../../validations/admin/user.validation");

const validate = require("../../middlewares/validate.middleware");

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

module.exports = router;
