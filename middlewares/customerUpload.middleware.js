const upload = require("./upload.middleware");

const customerUpload = upload.fields([
  { name: "emiratesIdFront", maxCount: 1 },
  { name: "emiratesIdBack", maxCount: 1 },
  { name: "drivingLicenseFront", maxCount: 1 },
  { name: "drivingLicenseBack", maxCount: 1 },
  { name: "passport", maxCount: 1 },
  { name: "visaCopy", maxCount: 1 },
]);

module.exports = customerUpload;
