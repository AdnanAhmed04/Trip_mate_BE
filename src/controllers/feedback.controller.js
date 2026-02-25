const Feedback = require("../models/Feedback");

exports.createFeedback = async (req, res) => {
    try {
        const userId = req.user.id;

        // Check if user already submitted feedback
        const existingFeedback = await Feedback.findOne({ user: userId });
        if (existingFeedback) {
            return res.status(400).json({ message: "You have already submitted feedback. Only one submission per user is allowed." });
        }

        const { name, profession, rating, feedback } = req.body;

        let imagePath = null;
        if (req.file) {
            // Accessable via /uploads/feedbacks/filename
            imagePath = `/uploads/feedbacks/${req.file.filename}`;
        }

        const newFeedback = new Feedback({
            user: userId,
            name,
            profession,
            rating,
            feedback,
            image: imagePath,
        });

        await newFeedback.save();

        res.status(201).json({
            message: "Feedback submitted successfully",
            feedback: newFeedback,
        });
    } catch (error) {
        console.error("Error creating feedback:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getAllFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find().sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (error) {
        console.error("Error fetching feedbacks:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
