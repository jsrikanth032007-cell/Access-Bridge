import { ZodError } from 'zod';

export const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]:', err);

  // Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please check the supplied inputs.',
      errors: formattedErrors,
    });
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds the 10MB limit. Please upload a smaller file.',
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
    });
  }

  // CastError or MongoDB duplicate key
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'An account with that email already exists.',
    });
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
  });
};

