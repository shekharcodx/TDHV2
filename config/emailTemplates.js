exports.templates = [
  {
    name: "temporary_password",
    subject: "Your Temporary Password",
    body: `
        <h1>Welcome, {{name}}!</h1>
        <p>Your temporary password is: <strong>{{tempPassword}}</strong></p>
        <p>Please login and change your password immediately.</p>
      `,
    description: "Sent to vendors upon registration with temporary password.",
  },
  {
    name: "welcome_customer",
    subject: "Welcome to Our Platform",
    body: `
        <h1>Hello, {{name}}!</h1>
        <p>Thanks for signing up as a customer.</p>
      `,
    description: "Welcome email for customers.",
  },
  {
    name: "welcome_vendor",
    subject: "Welcome to Our Vendor Platform",
    body: `
        <h1>Hello, {{name}}!</h1>
        <p>Thanks for signing up as a vendor.</p>
      `,
    description: "Welcome email for vendors.",
  },
  {
    name: "password_changed",
    subject: "Password Changed Successfully",
    body: `
        <h1>Hello {{name}},</h1>
        <p>This is a confirmation that the password for your account was successfully changed.</p>
        <p>If you made this change, no further action is needed. If you did not make this change, please contact support immediately.</p>
        <p>Thank you,<br />The Support Team</p>
      `,
    description: "Sent when a user requests a password reset.",
  },
  {
    name: "account_deactivated",
    subject: "Account Deactivated",
    body: `
        <h1>Dear {{name}},</h1>
        <p>Your account has been deactivated. Please contact support for further assistance.</p>
      `,
    description: "Sent when a user's account is deactivated.",
  },
  {
    name: "account_approved",
    subject: "Account Approved",
    body: `
        <h1>Congratulations {{name}},</h1>
        <p>Your account has been approved. You can now access all features.</p>
      `,
    description: "Sent when a user's account is approved.",
  },
  {
    name: "account_on_hold",
    subject: "Account On Hold",
    body: `
        <h1>Dear {{name}},</h1>
        <p>Your account is currently on hold. Please contact support for more information.</p>
      `,
    description: "Sent when a user's account is put on hold.",
  },
  {
    name: "account_blocked",
    subject: "Account Blocked",
    body: `
        <h1>Dear {{name}},</h1>
        <p>Your account has been blocked due to suspicious activity. Please contact support for further assistance.</p>
      `,
    description: "Sent when a user's account is blocked.",
  },
  {
    name: "password_reset",
    subject: "Password Reset Request",
    body: `
        <h1>Hello {{name}},</h1>
        <p>We received a request to reset your password. Click the link below to reset it:</p>
        <p><a href="{{resetLink}}">Reset Password</a></p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    description: "Sent when a user requests a password reset.",
  },
];
