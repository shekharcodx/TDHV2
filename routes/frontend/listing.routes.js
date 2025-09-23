const express = require("express");
const router = express.Router();
const {
  getAllListings,
} = require("../../controllers/frontend/listing.controller");

router.get("/listings", getAllListings);

module.exports = router;
