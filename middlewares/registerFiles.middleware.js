const upload = require("./upload.middleware");

const cpUpload = upload.fields([
  { name: "ijariCertificate", maxCount: 1 },
  { name: "tradeLicense", maxCount: 1 },
  { name: "vatCertificate", maxCount: 1 },
  { name: "noc", maxCount: 1 },
  { name: "emiratesId", maxCount: 1 },
  { name: "poa", maxCount: 1 },
  { name: "profilePicture", maxCount: 1 },
  { name: "emiratesIdFront", maxCount: 1 },
  { name: "emiratesIdBack", maxCount: 1 },
  { name: "drivingLicenseFront", maxCount: 1 },
  { name: "drivingLicenseBack", maxCount: 1 },
  { name: "passport", maxCount: 1 },
  { name: "visaCopy", maxCount: 1 },
]);

module.exports = cpUpload;
