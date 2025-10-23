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
  {
    name: "booking_created_payment_pending",
    subject: "Your Booking Has Been Created – Complete Your Payment",
    body: `
    <h1>Hello {{name}},</h1>
    <p>Thank you for choosing The Drive Hub!</p>
    <p>Your booking for <strong>{{carName}}</strong> from <strong>{{pickupDate}}</strong> to <strong>{{dropoffDate}}</strong> has been created successfully.</p>
    <p>To confirm your booking, please complete your payment now.</p>
    <p><strong>Booking Summary:</strong></p>
    <ul>
      <li>Car: {{carName}}</li>
      <li>Pickup Location: {{pickupLocation}}</li>
      <li>Drop-off Location: {{dropoffLocation}}</li>
      <li>Price Type: {{priceType}}</li>
      <li>Total Amount: {{totalAmount}}</li>
    </ul>
    <p>If you have any questions, feel free to contact our support team.</p>
    <p>Thank you,<br/>The Drive Hub Team</p>
  `,
    description:
      "Sent when a booking is created and payment from the customer is pending.",
  },
  {
    name: "vendor_booking_confirmation_request",
    subject: "New Booking Request – Please Confirm the Booking",
    body: `
    <h1>Hello {{vendorName}},</h1>
    <p>You have received a new booking request on <strong>The Drive Hub</strong>.</p>
    <p><strong>Booking Details:</strong></p>
    <ul>
      <li>Customer Name: {{customerName}}</li>
      <li>Car: {{carName}}</li>
      <li>Pickup Date: {{pickupDate}}</li>
      <li>Drop-off Date: {{dropoffDate}}</li>
      <li>Pickup Location: {{pickupLocation}}</li>
      <li>Drop-off Location: {{dropoffLocation}}</li>
      <li>Price Type: {{priceType}}</li>
      <li>Total Amount: {{totalAmount}}</li>
    </ul>
    <p>Please review this booking and confirm its availability as soon as possible.</p>
    <p>You can confirm or decline the booking by visiting your vendor dashboard:</p>
    <p><a href="{{dashboardLink}}" style="background-color:#007bff;color:white;padding:10px 20px;text-decoration:none;border-radius:4px;">Go to Dashboard</a></p>
    <p>If you do not respond within the required timeframe, this booking may be automatically cancelled or reassigned.</p>
    <p>Thank you for partnering with The Drive Hub!</p>
    <p>– The Drive Hub Team</p>
  `,
    description:
      "Sent to the vendor when a new booking is created. Requests them to confirm or reject the booking.",
  },
  {
    name: "vendor_onboarding",
    subject: "Complete Your Stripe Onboarding",
    body: `
    <h1>Hello {{name}},</h1>
    <p>Welcome to our platform! To start receiving payments, please complete your Stripe onboarding process.</p>
    <p>Click the link below to securely complete your onboarding on Stripe:</p>
    <p><a href="{{onboardingLink}}" target="_blank" style="color: #635bff; font-weight: bold;">Complete Onboarding</a></p>
    <p>If you’ve already completed this step, you can safely ignore this email.</p>
    <br/>
    <p>Thank you,<br/>The Drive Hub Team</p>
  `,
    description:
      "Sent when an admin generates and sends a Stripe onboarding link to a vendor.",
  },
];
