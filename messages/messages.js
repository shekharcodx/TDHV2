module.exports = {
  AUTH_INVALID_PASSWORD: {
    code: 9000,
    error: "AUTH_INVALID_PASSWORD",
    message: "Invalid password",
  },
  AUTH_USER_NOT_FOUND: {
    code: 9001,
    error: "AUTH_USER_NOT_FOUND",
    message: "User not found",
  },
  AUTH_INVALID_CREDENTIALS: {
    code: 9002,
    error: "AUTH_INVALID_CREDENTIALS",
    message: "Invalid credentials",
  },
  AUTH_USER_ALREADY_EXISTS: {
    code: 9003,
    error: "AUTH_USER_ALREADY_EXISTS",
    message: "User already exists",
  },
  AUTH_REGISTRAION_ROLE_INVALID: {
    code: 9004,
    error: "AUTH_REGISTRAION_ROLE_INVALID",
    message: "Invalid role for registration",
  },
  AUTH_TOKEN_EXPIRED: {
    code: 9005,
    error: "AUTH_TOKEN_EXPIRED",
    message: "Token expired",
  },
  AUTH_REGISTRATION_SUCCESS: {
    code: 9006,
    message: "Registration successful",
  },
  AUTH_REGISTRATION_APPROVAL_PENDING: {
    code: 9007,
    message: "Registration successful, Please wait for admin's approval",
  },
  AUTH_CHECK_EMAIL_FOR_TEMP_PASSWORD: {
    code: 9008,
    message:
      "Registration successful, Please check your email for login link and password",
  },
  AUTH_VENDOR_PENDING_APPROVAL: {
    code: 9009,
    message: "Vendor registration pending for admin's approval",
  },
  AUTH_VENDOR_CREATE_NEW_PASSWORD: {
    code: 9010,
    error: "AUTH_VENDOR_CREATE_NEW_PASSWORD",
    message: "Please create a new password before proceeding!",
  },
  AUTH_LOGIN_SUCCESS: {
    code: 9011,
    message: "Login successful",
  },
  AUTH_PASSWORD_CHANGED: {
    code: 9012,
    message: "Password updated successfully, Please login with new password",
  },
  USER_FOUND: {
    code: 9013,
    message: "User found",
  },
  GENERAL_SERVER_ERROR: {
    code: 9014,
    error: "GENERAL_SERVER_ERROR",
    message: "An unexpected error occurred",
  },
  PROFILE_UPDATED: {
    code: 9015,
    message: "Profile updated successfully",
  },
  NOT_AUTHORIZED: {
    code: 9016,
    error: "UNAUTHORIZED",
    message: "You are not authorized to perform this action",
  },
  NOT_AUTHORIZED_NO_TOKEN: {
    code: 9017,
    error: "UNAUTHORIZED_NO_TOKEN",
    message:
      "You are not authorized to perform this action, Please login first",
  },
  API_NOT_FOUND: {
    code: 9018,
    error: "API_NOT_FOUND",
    message: "API not found",
  },
  NOT_ALLOWED_TO_PERFORM_THIS_OPERATION: {
    code: 9019,
    error: "NOT_ALLOWED_TO_PERFORM_THIS_OPERATION",
    message: "You are not allowed to perform this operation",
  },
  ACCESS_DENIED: {
    code: 9020,
    error: "ACCESS_DENIED",
    message: "You are not allowed to perform this operation",
  },
  INTERNAL_SERVER_ERROR: {
    code: 9021,
    error: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
  },
  ACCOUNT_DEACTIVATED: {
    code: 9022,
    error: "ACCOUNT_DEACTIVATED",
    message:
      "Your account has been deactivated, Please contact support for further assistance",
  },
  USER_UPDATED: {
    code: 9023,
    message: "User status updated successfully",
  },
  AUTH_PASSWORD_RESET_SUCCESS: {
    code: 9024,
    message: "Password reset successful, Please login with new password",
  },
  RESET_LINK_SENT: {
    code: 9025,
    message: "Password reset link sent to your email",
  },
  AUTH_INVALID_RESET_TOKEN: {
    code: 9026,
    error: "AUTH_INVALID_RESET_TOKEN",
    message: "Invalid or expired token",
  },
  AUTH_RESET_TOKEN_REQUIRED: {
    code: 9027,
    error: "AUTH_RESET_TOKEN_REQUIRED",
    message: "Password reset token is required",
  },
  ACCOUNT_NOT_APPROVED: {
    code: 9028,
    error: "ACCOUNT_NOT_APPROVED",
    message: "Your account has not been approved, please contact support",
  },
  CAR_ALREADY_BOOKED: {
    code: 3000,
    error: "CAR_ALREADY_BOOKED",
    message: "Car already booked for selected dates",
  },
  BOOKING_CREATED: {
    code: 3001,
    message: `Booking created successfully, please complete payment within ${process.env.UNPAID_EXPIRY_MINUTES} minutes`,
  },
  CAR_NOT_FOUND: {
    code: 3002,
    error: "CAR_NOT_FOUND",
    message: "Car not found, please try again",
  },
};
