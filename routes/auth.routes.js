const express = require("express");
const router = express.Router();
const validate = require("../middlewares/validate.middleware");
const protect = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const cpUpload = require("../middlewares/registerFiles.middleware");
const {
  register,
  login,
  updateProfile,
} = require("../controllers/auth.controller");
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
} = require("../validations/auth.validation");

router.post("/register", cpUpload, registerValidation, validate, register);

router.put(
  "/updateProfile",
  upload.single("profilePicture"),
  updateProfileValidation,
  validate,
  protect,
  updateProfile
);

router.post("/login", loginValidation, validate, login);

module.exports = router;
