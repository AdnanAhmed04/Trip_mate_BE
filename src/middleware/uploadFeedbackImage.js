const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFeedbackImage = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/"))
      return cb(new Error("File must be an image"), false);
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

async function uploadFeedbackToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: "feedbacks" }, (err, result) => {
      if (err) reject(err);
      else resolve(result.secure_url);
    });
    Readable.from(buffer).pipe(stream);
  });
}

module.exports = { uploadFeedbackImage, uploadFeedbackToCloudinary };
