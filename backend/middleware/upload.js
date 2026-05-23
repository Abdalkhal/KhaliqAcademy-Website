const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'video') {
      cb(null, 'uploads/videos/');
    } else if (file.fieldname === 'thumbnail') {
      cb(null, 'uploads/thumbnails/');
    } else {
      cb(null, 'uploads/');
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = crypto.randomBytes(16).toString('hex');
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'video') {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid video format. Only MP4, WebM, OGG allowed.'), false);
    }
  } else if (file.fieldname === 'thumbnail') {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image format. Only JPEG, PNG, WebP allowed.'), false);
    }
  } else {
    cb(null, true);
  }
};

// Upload limits
const limits = {
  fileSize: 500 * 1024 * 1024, // 500MB for videos
  files: 1
};

const upload = multer({ storage, fileFilter, limits });

module.exports = upload;
