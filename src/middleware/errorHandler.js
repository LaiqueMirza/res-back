/**
 * Global Error Handling Middleware
 * Catches and formats all errors in the application
 */

const logger = require('../utils/logger');

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Common API error responses
 */
const apiErrors = {
  badRequest: (message = 'Bad Request') => new ApiError(400, message),
  unauthorized: (message = 'Unauthorized') => new ApiError(401, message),
  forbidden: (message = 'Forbidden') => new ApiError(403, message),
  notFound: (message = 'Resource not found') => new ApiError(404, message),
  conflict: (message = 'Resource already exists') => new ApiError(409, message),
  tooManyRequests: (message = 'Too many requests') => new ApiError(429, message),
  internal: (message = 'Internal Server Error') => new ApiError(500, message, false),
  notImplemented: (message = 'Not Implemented') => new ApiError(501, message),
  serviceUnavailable: (message = 'Service Unavailable') => new ApiError(503, message),
};

/**
 * Convert error to API error
 */
const convertErrorToApiError = (err) => {
  let error = err;
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    const message = Object.values(err.errors)
      .map(e => e.message)
      .join(', ');
    error = new ApiError(400, message);
  } else if (err.name === 'CastError') {
    // Mongoose cast error (invalid ID)
    error = new ApiError(400, `Invalid ${err.path}: ${err.value}`);
  } else if (err.code === 11000) {
    // MongoDB duplicate key error
    const field = Object.keys(err.keyPattern)[0];
    error = new ApiError(409, `${field} already exists`);
  } else if (err.name === 'JsonWebTokenError') {
    // JWT error
    error = new ApiError(401, 'Invalid token');
  } else if (err.name === 'TokenExpiredError') {
    // JWT expired
    error = new ApiError(401, 'Token expired');
  } else if (err.name === 'MulterError') {
    // File upload error
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = new ApiError(400, 'File size exceeds limit');
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      error = new ApiError(400, 'Too many files uploaded');
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      error = new ApiError(400, 'Unexpected file field');
    } else {
      error = new ApiError(400, err.message);
    }
  } else if (!(err instanceof ApiError)) {
    // Unknown error - convert to generic API error
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, false, err.stack);
  }
  
  return error;
};

/**
 * Log error
 */
const logError = (err, req) => {
  const errorLog = {
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id,
    timestamp: new Date().toISOString(),
  };
  
  if (err.statusCode >= 500) {
    logger.error('Server Error', errorLog);
  } else if (err.statusCode >= 400) {
    logger.warn('Client Error', errorLog);
  } else {
    logger.info('Error', errorLog);
  }
};

/**
 * Send error response
 */
const sendErrorResponse = (err, res) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const response = {
    success: false,
    statusCode: err.statusCode,
    message: err.message,
  };
  
  // Include stack trace in development
  if (isDevelopment) {
    response.stack = err.stack;
  }
  
  // Include additional details for operational errors
  if (err.isOperational && err.details) {
    response.details = err.details;
  }
  
  res.status(err.statusCode).json(response);
};

/**
 * Main error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Convert error to ApiError
  const error = convertErrorToApiError(err);
  
  // Log error
  logError(error, req);
  
  // Send error response
  sendErrorResponse(error, res);
};

/**
 * Handle 404 errors
 */
const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`);
  next(error);
};

/**
 * Async handler wrapper
 * Catches errors in async route handlers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Handle uncaught exceptions
 */
const handleUncaughtException = () => {
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    
    // Exit process
    process.exit(1);
  });
};

/**
 * Handle unhandled promise rejections
 */
const handleUnhandledRejection = () => {
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection', {
      reason: reason,
      promise: promise,
      timestamp: new Date().toISOString(),
    });
    
    // Exit process
    process.exit(1);
  });
};

/**
 * Initialize error handlers
 */
const initializeErrorHandlers = () => {
  handleUncaughtException();
  handleUnhandledRejection();
};

module.exports = {
  ApiError,
  apiErrors,
  errorHandler,
  notFoundHandler,
  asyncHandler,
  initializeErrorHandlers,
};
