const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const ctrl = require("../controllers/trip.controller");

router.use(requireAuth);

router.post("/", ctrl.createTrip);
router.get("/", ctrl.getTrips);
router.get("/:id", ctrl.getTripById);
router.patch("/:id", ctrl.updateTrip);
router.delete("/:id", ctrl.deleteTrip);

module.exports = router;
