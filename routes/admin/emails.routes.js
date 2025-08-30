const express = require("express");
const router = express.Router();
const {
  getEmailTempates,
  editEmailTemplate,
  getEmailTempatesById,
} = require("../../controllers/admin/emails.controller");
const {
  editEmailValidation,
  getEmailTempatesByIdValidate,
} = require("../../validations/admin/email.validation");
const validate = require("../../middlewares/validate.middleware");

router.get("/emailTempates", getEmailTempates);

router.get(
  "/emailTemplate/:templateId",
  getEmailTempatesByIdValidate,
  validate,
  getEmailTempatesById
);

router.put(
  "/emailTemplate/:templateId",
  editEmailValidation,
  validate,
  editEmailTemplate
);

module.exports = router;
