const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedback.controller");
const { uploadFeedbackImage } = require("../middleware/uploadFeedbackImage");
const { requireAuth } = require("../middleware/auth");

// POST /api/feedbacks - Create new feedback with image
router.post(
    "/",
    requireAuth,
    uploadFeedbackImage.single("image"),
    feedbackController.createFeedback
);

// GET /api/feedbacks - Get all feedbacks
router.get("/", feedbackController.getAllFeedbacks);

module.exports = router;
