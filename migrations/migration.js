let mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/user.model");

module.exports = async function runMigration() {
  try {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    const user = await User.findOneAndUpdate(
      { email: process.env.ADMIN_EMAIL },
      {
        $set: {
          name: "Admin",
          email: process.env.ADMIN_EMAIL,
          password: hashedPassword,
          role: 1,
          status: 1,
          profilePicture: null,
        },
      },
      { upsert: true, new: true }
    );
    console.log("SuperAdmin Inserted Successfully:", user);
  } catch (err) {
    console.error("Error running migrations:", err);
  }
};
