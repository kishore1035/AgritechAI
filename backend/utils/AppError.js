/**
 * Standardized Application Error Handler
 * All errors thrown in the app should use this class for consistency
 */

class AppError extends Error {
  constructor(message, statusCode, errorCode = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      error: {
        message: this.message,
        code: this.errorCode,
        statusCode: this.statusCode,
        timestamp: this.timestamp,
        ...(this.details && { details: this.details })
      }
    };
  }
}

// Specific Error Types
class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details = null) {
    super(message, 404, 'NOT_FOUND_ERROR', details);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflict occurred', details = null) {
    super(message, 409, 'CONFLICT_ERROR', details);
    this.name = 'ConflictError';
  }
}

class InternalServerError extends AppError {
  constructor(message = 'Internal server error', errorCode = 'INTERNAL_SERVER_ERROR', details = null) {
    super(message, 500, errorCode, details);
    this.name = 'InternalServerError';
  }
}

class ExternalServiceError extends AppError {
  constructor(serviceName, message = 'External service unavailable', details = null) {
    super(
      `${serviceName} service error: ${message}`,
      503,
      'EXTERNAL_SERVICE_ERROR',
      { service: serviceName, ...details }
    );
    this.name = 'ExternalServiceError';
    this.serviceName = serviceName;
  }
}

class TimeoutError extends AppError {
  constructor(serviceName, timeout = null) {
    const message = timeout 
      ? `${serviceName} request timed out after ${timeout}ms`
      : `${serviceName} request timed out`;
    super(message, 504, 'TIMEOUT_ERROR', { service: serviceName, timeout });
    this.name = 'TimeoutError';
    this.serviceName = serviceName;
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  InternalServerError,
  ExternalServiceError,
  TimeoutError
};
