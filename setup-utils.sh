#!/bin/bash

mkdir -p "/c/Users/PREETHI/Downloads/agritech-ai/frontend/src/utils"
echo "Utils directory created"

cat > "/c/Users/PREETHI/Downloads/agritech-ai/frontend/src/utils/errorHandler.js" << 'ERRORHANDLER'
/**
 * Production-Ready Error Handler Utilities
 * Provides comprehensive error handling for API calls, loading states, and error boundaries
 */

// ==================== Error Type Classification ====================

const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  CONFLICT: 'CONFLICT_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
};

// ==================== HTTP Status Code Mapping ====================

const HTTP_ERROR_MAP = {
  400: { type: ERROR_TYPES.VALIDATION, message: 'Invalid request parameters' },
  401: { type: ERROR_TYPES.AUTHENTICATION, message: 'Authentication required. Please log in.' },
  403: { type: ERROR_TYPES.AUTHORIZATION, message: 'You do not have permission to access this resource' },
  404: { type: ERROR_TYPES.NOT_FOUND, message: 'Resource not found' },
  409: { type: ERROR_TYPES.CONFLICT, message: 'Resource conflict. The resource may have been modified.' },
  422: { type: ERROR_TYPES.VALIDATION, message: 'Invalid data provided' },
  429: { type: ERROR_TYPES.VALIDATION, message: 'Too many requests. Please try again later.' },
  500: { type: ERROR_TYPES.SERVER, message: 'Server error. Please try again later.' },
  502: { type: ERROR_TYPES.SERVER, message: 'Bad gateway. Service temporarily unavailable.' },
  503: { type: ERROR_TYPES.SERVER, message: 'Service unavailable. Please try again later.' },
};

// ==================== Error Classification ====================

/**
 * Classifies an error and returns structured error information
 * @param {Error|AxiosError|any} error - The error to classify
 * @returns {Object} Structured error object
 */
export const classifyError = (error) => {
  const errorObject = {
    type: ERROR_TYPES.UNKNOWN,
    message: 'An unexpected error occurred',
    status: null,
    data: null,
    isRetryable: false,
    timestamp: new Date().toISOString(),
  };

  if (!error) {
    return errorObject;
  }

  // Handle Axios errors
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const errorInfo = HTTP_ERROR_MAP[status];

    errorObject.status = status;
    errorObject.data = error.response.data;

    if (errorInfo) {
      errorObject.type = errorInfo.type;
      errorObject.message = error.response.data?.message || errorInfo.message;
    } else {
      errorObject.message = error.response.data?.message || 'An error occurred';
    }

    // Determine if error is retryable
    errorObject.isRetryable = status >= 500 || status === 429;
  } else if (error.request) {
    // Request made but no response
    errorObject.type = ERROR_TYPES.NETWORK;
    errorObject.message = 'Network error. Please check your connection.';
    errorObject.isRetryable = true;
  } else if (error.message === 'timeout of ' + error.config?.timeout + 'ms exceeded') {
    // Timeout error
    errorObject.type = ERROR_TYPES.TIMEOUT;
    errorObject.message = 'Request timed out. Please try again.';
    errorObject.isRetryable = true;
  } else if (error instanceof TypeError) {
    // Network/CORS error
    errorObject.type = ERROR_TYPES.NETWORK;
    errorObject.message = 'Failed to connect to the server. Check your network connection.';
    errorObject.isRetryable = true;
  } else if (error.message) {
    // Generic error with message
    errorObject.message = error.message;
    errorObject.isRetryable = false;
  }

  return errorObject;
};

// ==================== API Error Handling ====================

/**
 * Creates a wrapped API call with automatic error classification and retry logic
 * @param {Function} apiCall - The API function to call
 * @param {Object} options - Configuration options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.retryDelay - Delay between retries in ms (default: 1000)
 * @param {Function} options.onRetry - Callback when retrying
 * @returns {Promise} Result or classified error
 */
export const callWithErrorHandling = async (
  apiCall,
  options = {}
) => {
  const { maxRetries = 3, retryDelay = 1000, onRetry } = options;
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await apiCall();
      return {
        success: true,
        data: result,
        error: null,
      };
    } catch (error) {
      lastError = error;
      const classifiedError = classifyError(error);

      if (!classifiedError.isRetryable || attempt === maxRetries) {
        return {
          success: false,
          data: null,
          error: classifiedError,
        };
      }

      // Exponential backoff
      const delay = retryDelay * Math.pow(2, attempt);
      if (onRetry) {
        onRetry(attempt + 1, maxRetries, delay, classifiedError);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // Fallback error
  return {
    success: false,
    data: null,
    error: classifyError(lastError),
  };
};

/**
 * Formats error for user display
 * @param {Object} error - Classified error object
 * @param {Object} options - Display options
 * @param {boolean} options.includeDetails - Include technical details (default: false)
 * @param {string} options.language - Language for messages (default: 'en')
 * @returns {string} User-friendly error message
 */
export const formatErrorMessage = (error, options = {}) => {
  const { includeDetails = false, language = 'en' } = options;

  if (!error || !error.message) {
    return 'An unexpected error occurred';
  }

  let message = error.message;

  if (includeDetails && error.status) {
    message += ` (Error ${error.status})`;
  }

  if (includeDetails && error.data?.details) {
    message += `: ${error.data.details}`;
  }

  return message;
};

// ==================== Loading State Management ====================

/**
 * Creates a loading state manager for async operations
 * Tracks loading, error, and success states
 */
export class LoadingStateManager {
  constructor() {
    this.state = {
      isLoading: false,
      error: null,
      isSuccess: false,
      successMessage: null,
      retryCount: 0,
      maxRetries: 3,
    };
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  start() {
    this.state = {
      ...this.state,
      isLoading: true,
      error: null,
      isSuccess: false,
      successMessage: null,
      retryCount: 0,
    };
    this.notifyListeners();
  }

  success(message = null) {
    this.state = {
      ...this.state,
      isLoading: false,
      isSuccess: true,
      successMessage: message,
      error: null,
    };
    this.notifyListeners();
  }

  error(error) {
    const classifiedError = classifyError(error);
    this.state = {
      ...this.state,
      isLoading: false,
      error: classifiedError,
      isSuccess: false,
    };
    this.notifyListeners();
  }

  retry() {
    this.state = {
      ...this.state,
      retryCount: this.state.retryCount + 1,
    };
    if (this.state.retryCount <= this.state.maxRetries) {
      this.start();
    }
  }

  reset() {
    this.state = {
      isLoading: false,
      error: null,
      isSuccess: false,
      successMessage: null,
      retryCount: 0,
      maxRetries: 3,
    };
    this.notifyListeners();
  }

  getState() {
    return { ...this.state };
  }
}

// ==================== Error Boundary Utilities ====================

/**
 * Logs error to external service (e.g., Sentry, LogRocket)
 * @param {Object} error - Error object
 * @param {Object} context - Additional context information
 */
export const logErrorToService = (error, context = {}) => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    ...context,
    ...error,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorInfo);
  }

  // Send to error tracking service (implement based on your setup)
  // Example: window.Sentry?.captureException(error, { extra: context })
};

/**
 * Generic error boundary error handler
 * @param {Error} error - The caught error
 * @param {Object} errorInfo - Additional error information from React
 * @returns {Object} Structured error information
 */
export const handleErrorBoundaryError = (error, errorInfo) => {
  const classifiedError = classifyError(error);

  logErrorToService(classifiedError, {
    componentStack: errorInfo.componentStack,
    errorBoundary: true,
  });

  return {
    error: classifiedError,
    showDetails: process.env.NODE_ENV === 'development',
    suggestionMessage: getSuggestionMessage(classifiedError.type),
  };
};

/**
 * Provides user-friendly suggestions based on error type
 * @param {string} errorType - The classified error type
 * @returns {string} Suggestion message
 */
export const getSuggestionMessage = (errorType) => {
  const suggestions = {
    [ERROR_TYPES.NETWORK]:
      'Please check your internet connection and try again.',
    [ERROR_TYPES.TIMEOUT]:
      'The request took too long. Please try again or contact support if the problem persists.',
    [ERROR_TYPES.VALIDATION]:
      'Please check your input and try again.',
    [ERROR_TYPES.AUTHENTICATION]:
      'Your session has expired. Please log in again.',
    [ERROR_TYPES.AUTHORIZATION]:
      'You do not have permission to perform this action.',
    [ERROR_TYPES.NOT_FOUND]:
      'The requested resource could not be found. It may have been deleted.',
    [ERROR_TYPES.CONFLICT]:
      'The resource has been modified by someone else. Please refresh and try again.',
    [ERROR_TYPES.SERVER]:
      'The server is experiencing issues. Please try again later.',
    [ERROR_TYPES.UNKNOWN]:
      'An unexpected error occurred. Please try again later.',
  };

  return suggestions[errorType] || suggestions[ERROR_TYPES.UNKNOWN];
};

// ==================== Validation Error Handler ====================

/**
 * Formats validation errors from API response
 * @param {Object} data - API response data
 * @returns {Object} Formatted validation errors keyed by field
 */
export const formatValidationErrors = (data) => {
  if (!data) {
    return {};
  }

  const errors = {};

  // Handle array of validation errors
  if (Array.isArray(data.errors)) {
    data.errors.forEach((error) => {
      const field = error.field || 'general';
      errors[field] = error.message || 'Invalid value';
    });
  }

  // Handle object of validation errors
  if (typeof data.errors === 'object' && !Array.isArray(data.errors)) {
    Object.assign(errors, data.errors);
  }

  // Handle single field error
  if (data.field && data.message) {
    errors[data.field] = data.message;
  }

  return errors;
};

// ==================== Retry Helper ====================

/**
 * Creates a retry strategy with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {Object} options - Retry options
 * @returns {Promise} Result of successful execution
 */
export const retryWithBackoff = async (fn, options = {}) => {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts) {
        throw error;
      }

      const delay = Math.min(
        initialDelay * Math.pow(backoffMultiplier, attempt - 1),
        maxDelay
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

// ==================== Error Context Helper ====================

/**
 * Adds context to an error for better debugging
 * @param {Error} error - Original error
 * @param {Object} context - Context object
 * @returns {Object} Error with context
 */
export const addErrorContext = (error, context) => {
  return {
    ...classifyError(error),
    context,
  };
};

// ==================== Export all error types ====================

export { ERROR_TYPES, HTTP_ERROR_MAP };

export default {
  ERROR_TYPES,
  HTTP_ERROR_MAP,
  classifyError,
  callWithErrorHandling,
  formatErrorMessage,
  LoadingStateManager,
  logErrorToService,
  handleErrorBoundaryError,
  getSuggestionMessage,
  formatValidationErrors,
  retryWithBackoff,
  addErrorContext,
};
ERRORHANDLER

echo "errorHandler.js file created"
echo "Setup completed successfully!"
