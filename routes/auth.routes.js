const express = require("express");
const router = express.Router();

const {
  register,
  login,
  updateProfile,
} = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const protect = require("../middlewares/auth.middleware");
const {
  registerValidation,
  loginValidation,
} = require("../validations/auth.validation");
const upload = require("../middlewares/upload.middleware");
const { updateProfileValidation } = require("../validations/auth.validation");

router.post(
  "/register",
  upload.single("profilePicture"),
  registerValidation,
  validate,
  register
);

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
