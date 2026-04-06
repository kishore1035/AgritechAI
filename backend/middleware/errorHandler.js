/**
 * Global Error Handling Middleware
 * Catches all errors and returns standardized responses
 */

const { AppError } = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  // Log error details for debugging
  console.error('ERROR:', {
    message: err.message,
    code: err.errorCode || 'UNKNOWN',
    statusCode: err.statusCode || 500,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.originalUrl,
    method: req.method
  });

  // Handle AppError instances
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.errorCode,
        statusCode: err.statusCode,
        timestamp: err.timestamp,
        ...(err.details && { details: err.details })
      }
    });
  }

  // Handle MongoDB validation errors
  if (err.name === 'ValidationError') {
    const fields = Object.keys(err.errors).map(field => ({
      field,
      message: err.errors[field].message
    }));
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        timestamp: new Date().toISOString(),
        details: { fields }
      }
    });
  }

  // Handle MongoDB duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      error: {
        message: `Duplicate value for field: ${field}`,
        code: 'DUPLICATE_FIELD',
        statusCode: 409,
        timestamp: new Date().toISOString(),
        details: { field }
      }
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
        statusCode: 401,
        timestamp: new Date().toISOString()
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Token expired',
        code: 'TOKEN_EXPIRED',
        statusCode: 401,
        timestamp: new Date().toISOString(),
        details: { expiredAt: err.expiredAt }
      }
    });
  }

  // Handle Axios errors (external service calls)
  if (err.config && err.response) {
    return res.status(err.response.status || 503).json({
      success: false,
      error: {
        message: `External service error: ${err.message}`,
        code: 'EXTERNAL_SERVICE_ERROR',
        statusCode: err.response.status || 503,
        timestamp: new Date().toISOString(),
        details: {
          service: err.config.url,
          originalStatus: err.response.status
        }
      }
    });
  }

  // Handle timeout errors
  if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
    return res.status(504).json({
      success: false,
      error: {
        message: 'Request timeout - service took too long to respond',
        code: 'TIMEOUT_ERROR',
        statusCode: 504,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Generic fallback error
  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred'
    : err.message;

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: errorCode,
      statusCode,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { debug: err.message })
    }
  });
};

module.exports = errorHandler;
