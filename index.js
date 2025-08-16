const express = require("express");
const helmet = require("helmet");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const bodyParser = require("body-parser");

dotenv.config();

const runMigration = require("./migrations/migration");
const apisMiddleware = require("./middlewares/api.middleware");
const aclMiddleware = require("./middlewares/acl.middleware");
const authMiddleware = require("./middlewares/auth.middleware");

const app = express();

// Security headers
app.use(helmet());

// CORS
const corsOptions = {
  origin: "*",
  credentials: false,
  methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
};
app.use(cors(corsOptions));

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
app.use("/api", require("./routes/auth.routes"));

app.use(authMiddleware);
app.use(aclMiddleware);

app.use("/api", require("./routes/admin/users.routes"));

app.use("/api", require("./routes/vendor/listing.routes"));

// Connect DB and run migrations
connectDB().then(() => runMigration());

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
