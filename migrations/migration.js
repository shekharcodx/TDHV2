let mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const EmailTemplate = require("../models/emailTemplates.model");
const { templates } = require("../config/emailTemplates");

module.exports = async function runMigration() {
  try {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    const user = await User.findOneAndUpdate(
      { email: process.env.ADMIN_EMAIL },
      {
        $setOnInsert: {
          name: "Admin",
          email: process.env.ADMIN_EMAIL,
          password: hashedPassword,
          role: 1,
          status: 2,
          profilePicture: null,
        },
      },
      { upsert: true, new: true }
    );
    console.log("SuperAdmin Inserted/updated Successfully:", user);

    for (let tpl of templates) {
      const exists = await EmailTemplate.findOne({ name: tpl.name });
      if (!exists) {
        await EmailTemplate.create(tpl);
        console.log("Email template(s) created", tpl.name);
      }
    }
  } catch (err) {
    console.error("Error running migrations:", err);
  }
};
