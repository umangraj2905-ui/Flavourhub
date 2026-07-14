const multer = require('multer');
const path = require('path');
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const storage = multer.diskStorage({
  destination: 'uploads/',
  // Do not trust a client-provided path; keep only a safe, generated filename.
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`)
});
module.exports = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(allowedTypes.has(file.mimetype) ? null : new Error('Only JPG, PNG, and WebP food images are allowed.'), allowedTypes.has(file.mimetype))
});
