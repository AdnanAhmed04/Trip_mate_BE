const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true, trim: true },
        profession: { type: String, trim: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        feedback: { type: String, required: true, trim: true },
        image: { type: String }, // Path to uploaded image
    },
    { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
