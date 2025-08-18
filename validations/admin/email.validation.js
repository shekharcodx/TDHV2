const { body, param } = require("express-validator");

exports.editEmailValidation = [
  body("name")
    .exists()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string"),
  body("subject")
    .exists()
    .withMessage("Subject is required")
    .isString()
    .withMessage("Subject must be a string"),
  body("body")
    .exists()
    .withMessage("Body is required")
    .isString()
    .withMessage("Body must be a string"),
  body("description")
    .exists()
    .withMessage("Description is required")
    .isString()
    .withMessage("Description must be a string"),
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
