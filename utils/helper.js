const fs = require("fs").promises;

async function safeUnlink(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.error("Failed to delete temp file:", err);
    }
  }
}

module.exports = { safeUnlink };
