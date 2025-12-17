const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const ctrl = require("../controllers/auth.controller");

router.post("/register", ctrl.register);
router.post("/login", ctrl.login);
router.get("/me", requireAuth, ctrl.me);
router.post("/logout", ctrl.logout);

module.exports = router;
