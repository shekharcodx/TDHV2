const express = require("express");
const helmet = require("helmet");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const { startBookingExpiryJob } = require("./utils/jobs/bookingExpiry");

dotenv.config();
const runMigration = require("./migrations/migration");
const apisMiddleware = require("./middlewares/api.middleware");
const aclMiddleware = require("./middlewares/acl.middleware");
const authMiddleware = require("./middlewares/auth.middleware");
const checkIsApproved = require("./middlewares/checkIsApproved");

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // disable the `X-RateLimit-*` headers
});

// app.use(limiter);

const allowedOrigins = [
  "http://localhost:5173", // dev frontend
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:3000",
  "https://tdhv2-vendor.vercel.app", // production frontend
  "https://tdhv-2-adminv2.vercel.app",
  "https://tdhv2-site2.vercel.app",
];

// CORS
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser requests like Postman
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // 🔑 allow cookies
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(cookieParser());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get("/", (req, res) => {
  res.json("Welcome to THE DRIVE HUB Api");
});

// Custom middleware
app.use(apisMiddleware);

// Routes
app.use("/api", require("./routes/common/auth.routes"));

app.use("/api", require("./routes/vendor/location.routes"));

app.use("/api", require("./routes/frontend/listing.routes"));

app.use(authMiddleware);
app.use(aclMiddleware);

app.use("/api", require("./routes/frontend/profile.routes"));

app.use("/api", require("./routes/admin/users.routes"));

app.use("/api", require("./routes/admin/locations.routes"));

app.use("/api", require("./routes/admin/emails.routes"));

app.use("/api", require("./routes/admin/car.routes"));

app.use("/api", require("./routes/admin/listing.routes"));

app.use("/api", require("./routes/common/listing.routes"));

app.use("/api", require("./routes/common/car.routes"));

app.use("/api", require("./routes/frontend/booking.routes"));

app.use("/api", require("./routes/admin/payment.routes"));

app.use(checkIsApproved);

app.use("/api", require("./routes/vendor/listing.routes"));

app.use("/api", require("./routes/vendor/user.routes"));

app.use("/api", require("./routes/vendor/bookings.routes"));

// Connect DB and run migrations
connectDB().then(() => runMigration());

// startBookingExpiryJob();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
