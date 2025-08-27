const express = require("express");
const router = express.Router();

const {
  getAllListings,
} = require("../../controllers/admin/listing.controller");

router.get("/allListings", getAllListings);

module.exports = router;
