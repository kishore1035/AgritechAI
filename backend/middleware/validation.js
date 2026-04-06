/**
 * Input Validation Middleware and Schemas
 */

const { ValidationError } = require('../utils/AppError');

// Validation helpers
const validators = {
  // Email validation
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  // Phone validation (simple international format)
  phone: (value) => {
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return phoneRegex.test(value.replace(/\s/g, ''));
  },

  // Latitude validation
  latitude: (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= -90 && num <= 90;
  },

  // Longitude validation
  longitude: (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= -180 && num <= 180;
  },

  // URL validation
  url: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  // Strong password check
  strongPassword: (value) => {
    // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(value);
  },

  // Crop name validation
  cropName: (value) => {
    const validCrops = [
      'rice', 'wheat', 'corn', 'soybean', 'cotton',
      'barley', 'oats', 'rye', 'sugarcane', 'potato',
      'tomato', 'onion', 'cabbage', 'carrot', 'lettuce',
      'apple', 'mango', 'banana', 'orange', 'grape'
    ];
    return validCrops.includes(value.toLowerCase());
  }
};

// Middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const data = { ...req.body, ...req.query, ...req.params };
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];

      // Check required
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push({ field, message: `${field} is required` });
        continue;
      }

      // Skip validation if not required and empty
      if (!rules.required && (value === undefined || value === null || value === '')) {
        continue;
      }

      // Type validation
      if (rules.type && value !== null && value !== undefined) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== rules.type) {
          errors.push({ 
            field, 
            message: `${field} must be of type ${rules.type}, got ${actualType}` 
          });
          continue;
        }
      }

      // Min length
      if (rules.minLength && value && value.length < rules.minLength) {
        errors.push({ 
          field, 
          message: `${field} must be at least ${rules.minLength} characters` 
        });
      }

      // Max length
      if (rules.maxLength && value && value.length > rules.maxLength) {
        errors.push({ 
          field, 
          message: `${field} must not exceed ${rules.maxLength} characters` 
        });
      }

      // Min value
      if (rules.min !== undefined && value < rules.min) {
        errors.push({ 
          field, 
          message: `${field} must be at least ${rules.min}` 
        });
      }

      // Max value
      if (rules.max !== undefined && value > rules.max) {
        errors.push({ 
          field, 
          message: `${field} must not exceed ${rules.max}` 
        });
      }

      // Custom validators
      if (rules.validator && !validators[rules.validator](value)) {
        const messages = {
          email: 'must be a valid email',
          phone: 'must be a valid phone number',
          latitude: 'must be between -90 and 90',
          longitude: 'must be between -180 and 180',
          url: 'must be a valid URL',
          strongPassword: 'must contain 8+ chars, uppercase, lowercase, number, and special char',
          cropName: 'must be a valid crop name'
        };
        errors.push({ 
          field, 
          message: `${field} ${messages[rules.validator] || 'is invalid'}` 
        });
      }

      // Enum validation
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push({ 
          field, 
          message: `${field} must be one of: ${rules.enum.join(', ')}` 
        });
      }
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', { fields: errors });
    }

    next();
  };
};

// Common schemas
const schemas = {
  registerUser: {
    name: { type: 'string', required: true, minLength: 2, maxLength: 100 },
    phone: { type: 'string', required: true, validator: 'phone' },
    password: { type: 'string', required: true, minLength: 8 },
    location: { type: 'string', maxLength: 200 }
  },

  loginUser: {
    phone: { type: 'string', required: true, validator: 'phone' },
    password: { type: 'string', required: true }
  },

  createFarm: {
    name: { type: 'string', required: true, minLength: 3, maxLength: 100 },
    location: { type: 'string', required: true, maxLength: 200 },
    latitude: { type: 'number', required: true, validator: 'latitude' },
    longitude: { type: 'number', required: true, validator: 'longitude' },
    area: { type: 'number', required: true, min: 0.1, max: 10000 },
    crops: { type: 'object', required: false }
  },

  soilReading: {
    farmId: { type: 'string', required: true },
    nitrogen: { type: 'number', required: true, min: 0, max: 500 },
    phosphorus: { type: 'number', required: true, min: 0, max: 500 },
    potassium: { type: 'number', required: true, min: 0, max: 500 },
    pH: { type: 'number', required: true, min: 4, max: 9 },
    moisture: { type: 'number', required: true, min: 0, max: 100 },
    temperature: { type: 'number', required: true, min: -40, max: 60 }
  },

  cropAnalysis: {
    cropName: { type: 'string', required: true, validator: 'cropName' },
    location: { type: 'string', required: true },
    imageFile: { type: 'object', required: false }
  }
};

// Middleware to attach validation
const attachValidators = (req, res, next) => {
  req.validators = validators;
  req.schemas = schemas;
  next();
};

module.exports = {
  validate,
  validators,
  schemas,
  attachValidators,
  ValidationError
};
