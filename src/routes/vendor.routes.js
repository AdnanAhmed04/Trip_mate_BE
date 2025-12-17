const router = require("express").Router();
const { uploadLogo } = require("../middleware/uploadLogo");
const ctrl = require("../controllers/vendor.controller");

router.post("/register", uploadLogo.single("logo"), ctrl.registerVendor);

// ✅ put /filter BEFORE /:id
router.get("/filter", ctrl.filterVendors);

// get all vendors
router.get("/", ctrl.getAllVendors);

// delete vendor by id
router.delete("/:id", ctrl.deleteVendor);

module.exports = router;
