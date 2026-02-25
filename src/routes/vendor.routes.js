const router = require("express").Router();
const { uploadLogo } = require("../middleware/uploadLogo");
const ctrl = require("../controllers/vendor.controller");

router.post("/register", uploadLogo.single("logo"), ctrl.registerVendor);

// put /filter BEFORE /:id
router.get("/filter", ctrl.filterVendors);

// get all vendors (public — only paid & non-blocked)
router.get("/", ctrl.getAllVendors);

// admin block / unblock
router.patch("/:id/block", ctrl.adminToggleBlock);

// delete vendor by id
router.delete("/:id", ctrl.deleteVendor);

module.exports = router;
