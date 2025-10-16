const upload = require("./upload.middleware");

const cpUpload = upload.fields([
  { name: "ijariCertificate", maxCount: 1 },
  { name: "tradeLicense", maxCount: 1 },
  { name: "vatCertificate", maxCount: 1 },
  { name: "noc", maxCount: 1 },
  { name: "emiratesId", maxCount: 1 },
  { name: "poa", maxCount: 1 },
  { name: "profilePicture", maxCount: 1 },
]);

module.exports = cpUpload;
