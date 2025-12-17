const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "uploads", "logos");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeBase = path
      .parse(file.originalname)
      .name.replace(/[^a-z0-9_-]/gi, "_")
      .slice(0, 40);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}_${safeBase}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  // Any image format
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Company logo must be an image file"), false);
  }
  cb(null, true);
}

const uploadLogo = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = { uploadLogo };
