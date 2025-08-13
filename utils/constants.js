exports.USER_ROLES = {
  ADMIN: 1,
  VENDOR: 2,
  CUSTOMER: 3,
};

exports.ACCOUNT_STATUS = {
  PENDING: 1,
  APPROVED: 2,
  ON_HOLD: 3,
  BLOCKED: 4,
};

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
];
