const express = require("express");
const router = express.Router();
const validate = require("../../middlewares/validate.middleware");
const authMiddleware = require("../../middlewares/auth.middleware");
const aclMiddleware = require("../../middlewares/acl.middleware");
const protect = require("../../middlewares/auth.middleware");
const upload = require("../../middlewares/upload.middleware");
const cpUpload = require("../../middlewares/registerFiles.middleware");
const {
  register,
  login,
  updateProfile,
  createNewPassword,
  getCurrentLoggedInUser,
  forgetPassword,
  resetPassword,
  updatePassword,
} = require("../../controllers/common/auth.controller");
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
  forgetPasswordValidation,
  resetPasswordValidation,
  updatePasswordValidation,
} = require("../../validations/common/auth.validation");

router.post("/register", cpUpload, registerValidation, validate, register);

router.post("/login", loginValidation, validate, login);

router.put(
  "/createNewPassword",
  changePasswordValidation,
  validate,
  createNewPassword
);

router.get("/getCurrentUser", protect, getCurrentLoggedInUser);

router.put(
  "/updateProfile",
  protect,
  upload.single("profilePicture"),
  updateProfileValidation,
  validate,
  updateProfile
);

router.post(
  "/forgetPassword",
  forgetPasswordValidation,
  validate,
  forgetPassword
);

router.put("/resetPassword", resetPasswordValidation, validate, resetPassword);

router.patch(
  "/updatePassword",
  authMiddleware,
  aclMiddleware,
  updatePasswordValidation,
  validate,
  updatePassword
);

module.exports = router;
