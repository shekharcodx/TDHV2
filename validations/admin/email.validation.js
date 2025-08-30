const { body, param } = require("express-validator");

exports.editEmailValidation = [
  body("name")
    .exists()
    .withMessage("name is required")
    .isString()
    .withMessage("name must be a string"),
  body("subject")
    .exists()
    .withMessage("subject is required")
    .isString()
    .withMessage("subject must be a string"),
  body("body")
    .exists()
    .withMessage("body is required")
    .isString()
    .withMessage("body must be a string"),
  body("description")
    .exists()
    .withMessage("description is required")
    .isString()
    .withMessage("description must be a string"),
  body("isActive")
    .exists()
    .withMessage("isActive is required")
    .isBoolean()
    .withMessage("isActive must be a boolean"),
  param("templateId")
    .exists()
    .withMessage("templateId is required")
    .isMongoId()
    .withMessage("templateId must be a valid mongo id"),
];

exports.getEmailTempatesByIdValidate = [
  param("templateId")
    .exists()
    .withMessage("templateId is required")
    .isMongoId()
    .withMessage("Invalid templateId"),
];
