const express = require("express");
const router = express.Router();
const {
  getEmailTempates,
  editEmailTemplate,
} = require("../../controllers/admin/emails.controller");
const {
  editEmailValidation,
} = require("../../validations/admin/email.validation");
const validate = require("../../middlewares/validate.middleware");

router.get("/getEmailTempates", getEmailTempates);

router.put(
  "/editEmailTemplate/:templateId",
  editEmailValidation,
  validate,
  editEmailTemplate
);

module.exports = router;
