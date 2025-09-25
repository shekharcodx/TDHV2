const express = require("express");
const router = express.Router();
const {
  getAllListings,
  getCarouselListings,
} = require("../../controllers/frontend/listing.controller");

router.get("/listings", getAllListings);

router.get("/carsByCategories", getCarouselListings);

module.exports = router;
