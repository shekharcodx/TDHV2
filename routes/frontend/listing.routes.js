const express = require("express");
const router = express.Router();
const {
  getAllListings,
  getCarouselListings,
  getCatelogListings,
  getListing,
  getfilteredListings,
  getSearchedListings,
} = require("../../controllers/frontend/listing.controller");

const validate = require("../../middlewares/validate.middleware");
const {
  getCatelogListingsValidation,
  getListingValidation,
} = require("../../validations/frontend/listing.validation");

router.get("/cars", getAllListings);

router.get("/home-page/data", getCarouselListings);

router.get(
  "/cars/:filterType/:filterId",
  getCatelogListingsValidation,
  validate,
  getCatelogListings
);

router.get("/car/:listingId", getListingValidation, validate, getListing);

router.get("/cars/filter", getfilteredListings);

router.get("/cars/search", getSearchedListings);

module.exports = router;
