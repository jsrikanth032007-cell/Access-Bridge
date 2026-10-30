import multer from 'multer';
import { env } from '../config/env.js';

// Use memory storage for direct buffer processing with Gemini and PDF parsers
const storage = multer.memoryStorage();

// Filter for allowed document and image types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'text/plain',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file type: ${file.mimetype}. Allowed types: PNG, JPEG, WEBP, GIF, PDF, TXT.`
      ),
      false
    );
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE_BYTES, // 10MB default
  },
  fileFilter,
});

