/**
 * Validation Middleware Unit Tests
 * Tests input validation, validators, and error handling
 */

const { validate, validators, schemas, ValidationError } = require('../../middleware/validation');

describe('Validators', () => {
  describe('email validator', () => {
    it('should validate correct email format', () => {
      expect(validators.email('test@example.com')).toBe(true);
      expect(validators.email('user+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(validators.email('invalid')).toBe(false);
      expect(validators.email('user@')).toBe(false);
      expect(validators.email('@example.com')).toBe(false);
    });
  });

  describe('phone validator', () => {
    it('should validate phone numbers', () => {
      expect(validators.phone('9998887776')).toBe(true);
      expect(validators.phone('+919998887776')).toBe(true);
      expect(validators.phone('+1-555-123-4567')).toBe(true);
      expect(validators.phone('(555) 123-4567')).toBe(true);
    });

    it('should reject invalid phone formats', () => {
      expect(validators.phone('123')).toBe(false);
      expect(validators.phone('invalid')).toBe(false);
    });
  });

  describe('latitude validator', () => {
    it('should validate latitude range -90 to 90', () => {
      expect(validators.latitude(-90)).toBe(true);
      expect(validators.latitude(0)).toBe(true);
      expect(validators.latitude(90)).toBe(true);
      expect(validators.latitude(37.7749)).toBe(true);
    });

    it('should reject latitudes outside range', () => {
      expect(validators.latitude(-91)).toBe(false);
      expect(validators.latitude(91)).toBe(false);
      expect(validators.latitude(200)).toBe(false);
    });
  });

  describe('longitude validator', () => {
    it('should validate longitude range -180 to 180', () => {
      expect(validators.longitude(-180)).toBe(true);
      expect(validators.longitude(0)).toBe(true);
      expect(validators.longitude(180)).toBe(true);
      expect(validators.longitude(-122.4194)).toBe(true);
    });

    it('should reject longitudes outside range', () => {
      expect(validators.longitude(-181)).toBe(false);
      expect(validators.longitude(181)).toBe(false);
      expect(validators.longitude(200)).toBe(false);
    });
  });

  describe('URL validator', () => {
    it('should validate correct URLs', () => {
      expect(validators.url('http://example.com')).toBe(true);
      expect(validators.url('https://example.com/path')).toBe(true);
      expect(validators.url('https://api.example.com:3000')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(validators.url('invalid')).toBe(false);
      expect(validators.url('not a url')).toBe(false);
    });
  });

  describe('cropName validator', () => {
    it('should validate known crop names', () => {
      expect(validators.cropName('rice')).toBe(true);
      expect(validators.cropName('wheat')).toBe(true);
      expect(validators.cropName('corn')).toBe(true);
      expect(validators.cropName('mango')).toBe(true);
    });

    it('should reject unknown crop names', () => {
      expect(validators.cropName('unknowncrop')).toBe(false);
      expect(validators.cropName('xyz')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(validators.cropName('RICE')).toBe(true);
      expect(validators.cropName('Rice')).toBe(true);
      expect(validators.cropName('WHEAT')).toBe(true);
    });
  });

  describe('strongPassword validator', () => {
    it('should validate strong passwords', () => {
      expect(validators.strongPassword('SecurePass123!')).toBe(true);
      expect(validators.strongPassword('MyPassword@2026')).toBe(true);
      expect(validators.strongPassword('Complex#Password99')).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(validators.strongPassword('weak')).toBe(false); // Too short
      expect(validators.strongPassword('nouppercase123!')).toBe(false); // No uppercase
      expect(validators.strongPassword('NOLOWERCASE123!')).toBe(false); // No lowercase
      expect(validators.strongPassword('NoNumbers!')).toBe(false); // No numbers
      expect(validators.strongPassword('NoSpecial123')).toBe(false); // No special char
    });
  });
});

describe('Validation Schemas', () => {
  describe('registerUser schema', () => {
    it('should validate all required fields', () => {
      const schema = schemas.registerUser;
      expect(schema.name.required).toBe(true);
      expect(schema.phone.required).toBe(true);
      expect(schema.password.required).toBe(true);
    });

    it('should enforce minimum lengths', () => {
      expect(schemas.registerUser.name.minLength).toBe(2);
      expect(schemas.registerUser.password.minLength).toBe(8);
    });
  });

  describe('loginUser schema', () => {
    it('should require phone and password', () => {
      expect(schemas.loginUser.phone.required).toBe(true);
      expect(schemas.loginUser.password.required).toBe(true);
    });

    it('should validate phone format', () => {
      expect(schemas.loginUser.phone.validator).toBe('phone');
    });
  });

  describe('createFarm schema', () => {
    it('should validate required farm fields', () => {
      const schema = schemas.createFarm;
      expect(schema.name.required).toBe(true);
      expect(schema.location.required).toBe(true);
      expect(schema.latitude.required).toBe(true);
      expect(schema.longitude.required).toBe(true);
      expect(schema.area.required).toBe(true);
    });

    it('should validate geographic coordinates', () => {
      expect(schemas.createFarm.latitude.validator).toBe('latitude');
      expect(schemas.createFarm.longitude.validator).toBe('longitude');
    });

    it('should enforce area constraints', () => {
      expect(schemas.createFarm.area.min).toBe(0.1);
      expect(schemas.createFarm.area.max).toBe(10000);
    });
  });

  describe('soilReading schema', () => {
    it('should validate all soil parameters', () => {
      const schema = schemas.soilReading;
      expect(schema.nitrogen.required).toBe(true);
      expect(schema.phosphorus.required).toBe(true);
      expect(schema.potassium.required).toBe(true);
      expect(schema.pH.required).toBe(true);
      expect(schema.moisture.required).toBe(true);
      expect(schema.temperature.required).toBe(true);
    });

    it('should enforce nutrient ranges', () => {
      expect(schemas.soilReading.nitrogen.min).toBe(0);
      expect(schemas.soilReading.nitrogen.max).toBe(500);
      expect(schemas.soilReading.phosphorus.max).toBe(500);
      expect(schemas.soilReading.potassium.max).toBe(500);
    });

    it('should enforce pH range', () => {
      expect(schemas.soilReading.pH.min).toBe(4);
      expect(schemas.soilReading.pH.max).toBe(9);
    });

    it('should enforce temperature range', () => {
      expect(schemas.soilReading.temperature.min).toBe(-40);
      expect(schemas.soilReading.temperature.max).toBe(60);
    });
  });
});

describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, query: {}, params: {} };
    res = {};
    next = jest.fn();
  });

  it('should pass validation with valid data', () => {
    req.body = {
      name: 'Test Farmer',
      phone: '+919998887776',
      password: 'SecurePass123!',
      location: 'Bangalore'
    };

    const middleware = validate(schemas.registerUser);
    expect(() => middleware(req, res, next)).not.toThrow();
  });

  it('should throw ValidationError on missing required field', () => {
    req.body = {
      name: 'Test Farmer',
      phone: '+919998887776',
      // Missing password
    };

    const middleware = validate(schemas.registerUser);
    expect(() => middleware(req, res, next)).toThrow(ValidationError);
  });

  it('should throw ValidationError on invalid format', () => {
    req.body = {
      name: 'Test',
      phone: 'invalid-phone',
      password: 'SecurePass123!',
      location: 'Bangalore'
    };

    const middleware = validate(schemas.registerUser);
    expect(() => middleware(req, res, next)).toThrow(ValidationError);
  });

  it('should validate min/max length constraints', () => {
    req.body = {
      name: 'X', // Too short
      phone: '+919998887776',
      password: 'SecurePass123!',
      location: 'Bangalore'
    };

    const middleware = validate(schemas.registerUser);
    expect(() => middleware(req, res, next)).toThrow(ValidationError);
  });
});

describe('Validation Error Details', () => {
  it('should include field-level error information', () => {
    try {
      const middleware = validate(schemas.registerUser);
      const req = {
        body: { name: 'X', phone: 'invalid' },
        query: {},
        params: {}
      };
      middleware(req, {}, () => {});
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.details).toBeDefined();
      expect(error.details.fields).toBeDefined();
      expect(Array.isArray(error.details.fields)).toBe(true);
    }
  });

  it('should provide helpful error messages', () => {
    try {
      const middleware = validate(schemas.registerUser);
      const req = {
        body: { name: 'X' },
        query: {},
        params: {}
      };
      middleware(req, {}, () => {});
    } catch (error) {
      const messages = error.details.fields.map(f => f.message);
      expect(messages.some(m => m.includes('required'))).toBe(true);
    }
  });
});
