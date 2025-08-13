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
  createNewPassword,
  getCurrentLoggedInUser,
} = require("../controllers/auth.controller");
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
} = require("../validations/auth.validation");

router.post("/register", cpUpload, registerValidation, validate, register);

router.post("/login", loginValidation, validate, login);

router.patch(
  "/createNewPassword",
  changePasswordValidation,
  validate,
  createNewPassword
);

router.get("/getCurrentUser", protect, getCurrentLoggedInUser);

router.put(
  "/updateProfile",
  upload.single("profilePicture"),
  updateProfileValidation,
  validate,
  protect,
  updateProfile
);

module.exports = router;
