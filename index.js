const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const runMigration = require("./migrations/migration");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

runMigration();

app.use("/api", require("./routes/auth.routes"));

app.get("/", (req, res) => {
  res.json("Hello World");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
