const router = require("express").Router();
const { uploadHotelImages } = require("../middleware/uploadLogo");
const ctrl = require("../controllers/hotel.controller");

// Hotel registration — up to 5 images, field name "images"
router.post("/register", uploadHotelImages.array("images", 5), ctrl.registerHotel);

// put /filter BEFORE /:id
router.get("/filter", ctrl.filterHotels);

// public listing — only approved & non-blocked
router.get("/", ctrl.getAllHotels);

// single hotel (approved only)
router.get("/:id", ctrl.getHotelById);

module.exports = router;
