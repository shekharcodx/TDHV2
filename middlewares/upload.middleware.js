const multer = require("multer");

// Store files in memory (not disk)
const storage = multer.memoryStorage();
const limits = { fileSize: 10 * 1024 * 1024 };

const upload = multer({ storage, limits });

module.exports = upload;
