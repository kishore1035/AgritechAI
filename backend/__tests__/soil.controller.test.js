/**
 * Soil Controller Unit Tests
 * Tests soil readings, analysis, and health scoring
 */

const request = require('supertest');
const express = require('express');
const soilRoute = require('../../routes/soil');
const { ValidationError } = require('../../utils/AppError');

jest.mock('../../config/localDb', () => ({
  readDb: jest.fn(),
  writeDb: jest.fn(),
}));

jest.mock('../../middleware/auth', (req, res, next) => next());

describe('Soil Controller', () => {
  let app;
  let localDb;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/soil', soilRoute);
    localDb = require('../../config/localDb');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/soil/readings', () => {
    it('should add soil reading with valid data', async () => {
      localDb.readDb.mockReturnValue({
        soilreadings: [],
        farms: [{ _id: 'farm1', userId: 'user1' }]
      });
      localDb.writeDb.mockReturnValue(true);

      const response = await request(app)
        .post('/api/soil/readings')
        .send({
          farmId: 'farm1',
          nitrogen: 50,
          phosphorus: 40,
          potassium: 60,
          pH: 6.5,
          moisture: 60,
          temperature: 25,
          organicMatter: 3.5
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.reading).toBeDefined();
    });

    it('should reject negative nutrient values', async () => {
      const response = await request(app)
        .post('/api/soil/readings')
        .send({
          farmId: 'farm1',
          nitrogen: -50, // Invalid
          phosphorus: 40,
          potassium: 60,
          pH: 6.5,
          moisture: 60,
          temperature: 25
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject nutrient values exceeding maximum', async () => {
      const response = await request(app)
        .post('/api/soil/readings')
        .send({
          farmId: 'farm1',
          nitrogen: 600, // Exceeds 500 limit
          phosphorus: 40,
          potassium: 60,
          pH: 6.5,
          moisture: 60,
          temperature: 25
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject pH values outside range', async () => {
      const testCases = [
        { pH: 2, valid: false }, // Below 4
        { pH: 4, valid: true },
        { pH: 6.5, valid: true },
        { pH: 9, valid: true },
        { pH: 10, valid: false } // Above 9
      ];

      for (const { pH, valid } of testCases) {
        const response = await request(app)
          .post('/api/soil/readings')
          .send({
            farmId: 'farm1',
            nitrogen: 50,
            phosphorus: 40,
            potassium: 60,
            pH,
            moisture: 60,
            temperature: 25
          });

        if (valid) {
          expect([200, 201]).toContain(response.status);
        } else {
          expect(response.status).toBe(400);
        }
      }
    });

    it('should reject moisture outside 0-100 range', async () => {
      const testCases = [
        { moisture: -10, valid: false },
        { moisture: 0, valid: true },
        { moisture: 50, valid: true },
        { moisture: 100, valid: true },
        { moisture: 150, valid: false }
      ];

      for (const { moisture, valid } of testCases) {
        const response = await request(app)
          .post('/api/soil/readings')
          .send({
            farmId: 'farm1',
            nitrogen: 50,
            phosphorus: 40,
            potassium: 60,
            pH: 6.5,
            moisture,
            temperature: 25
          });

        if (valid) {
          expect([200, 201]).toContain(response.status);
        } else {
          expect(response.status).toBe(400);
        }
      }
    });

    it('should reject temperature outside -40 to 60°C', async () => {
      const testCases = [
        { temperature: -50, valid: false },
        { temperature: -40, valid: true },
        { temperature: 0, valid: true },
        { temperature: 25, valid: true },
        { temperature: 60, valid: true },
        { temperature: 80, valid: false }
      ];

      for (const { temperature, valid } of testCases) {
        const response = await request(app)
          .post('/api/soil/readings')
          .send({
            farmId: 'farm1',
            nitrogen: 50,
            phosphorus: 40,
            potassium: 60,
            pH: 6.5,
            moisture: 60,
            temperature
          });

        if (valid) {
          expect([200, 201]).toContain(response.status);
        } else {
          expect(response.status).toBe(400);
        }
      }
    });

    it('should generate health score automatically', async () => {
      localDb.readDb.mockReturnValue({
        soilreadings: [],
        farms: [{ _id: 'farm1', userId: 'user1' }]
      });
      localDb.writeDb.mockReturnValue(true);

      const response = await request(app)
        .post('/api/soil/readings')
        .send({
          farmId: 'farm1',
          nitrogen: 50,
          phosphorus: 40,
          potassium: 60,
          pH: 6.5,
          moisture: 60,
          temperature: 25,
          organicMatter: 3.5
        });

      expect(response.body.data.reading.healthScore).toBeDefined();
      expect(response.body.data.reading.healthScore).toBeGreaterThanOrEqual(0);
      expect(response.body.data.reading.healthScore).toBeLessThanOrEqual(100);
    });

    it('should generate rating based on health score', async () => {
      localDb.readDb.mockReturnValue({
        soilreadings: [],
        farms: [{ _id: 'farm1', userId: 'user1' }]
      });
      localDb.writeDb.mockReturnValue(true);

      const response = await request(app)
        .post('/api/soil/readings')
        .send({
          farmId: 'farm1',
          nitrogen: 50,
          phosphorus: 40,
          potassium: 60,
          pH: 6.5,
          moisture: 60,
          temperature: 25,
          organicMatter: 3.5
        });

      const rating = response.body.data.reading.rating;
      expect(['Poor', 'Fair', 'Good', 'Excellent']).toContain(rating);
    });
  });

  describe('GET /api/soil/readings', () => {
    it('should get soil readings for a farm', async () => {
      localDb.readDb.mockReturnValue({
        soilreadings: [
          {
            _id: 'reading1',
            farmId: 'farm1',
            nitrogen: 50,
            healthScore: 75,
            timestamp: '2026-04-06T10:00:00Z'
          }
        ]
      });

      const response = await request(app)
        .get('/api/soil/readings')
        .query({ farmId: 'farm1' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.readings)).toBe(true);
    });

    it('should show trend analysis', async () => {
      const now = new Date();
      const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      localDb.readDb.mockReturnValue({
        soilreadings: [
          { healthScore: 60, timestamp: past.toISOString() },
          { healthScore: 65, timestamp: new Date(past.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString() },
          { healthScore: 72, timestamp: now.toISOString() }
        ]
      });

      const response = await request(app)
        .get('/api/soil/readings')
        .query({ farmId: 'farm1' });

      expect(response.body.data.trend).toBeDefined();
      expect(['improving', 'declining', 'stable']).toContain(response.body.data.trend);
    });

    it('should return most recent reading', async () => {
      const latestReading = {
        _id: 'latest',
        nitrogen: 55,
        timestamp: new Date().toISOString()
      };

      localDb.readDb.mockReturnValue({
        soilreadings: [
          { _id: 'old', nitrogen: 40, timestamp: '2026-03-01T00:00:00Z' },
          latestReading
        ]
      });

      const response = await request(app)
        .get('/api/soil/readings')
        .query({ farmId: 'farm1' });

      expect(response.body.data.lastReading._id).toBe('latest');
    });
  });

  describe('Soil Health Calculations', () => {
    it('should calculate health score based on multiple factors', async () => {
      localDb.readDb.mockReturnValue({
        soilreadings: [],
        farms: [{ _id: 'farm1', userId: 'user1' }]
      });
      localDb.writeDb.mockReturnValue(true);

      // Test with optimal values
      const response = await request(app)
        .post('/api/soil/readings')
        .send({
          farmId: 'farm1',
          nitrogen: 150, // Mid-optimal
          phosphorus: 90,
          potassium: 250,
          pH: 6.5, // Ideal
          moisture: 60, // Mid-range
          temperature: 25,
          organicMatter: 5
        });

      const score = response.body.data.reading.healthScore;
      expect(score).toBeGreaterThan(70); // Should be good
    });

    it('should rate Poor for deficient soils', async () => {
      localDb.readDb.mockReturnValue({
        soilreadings: [],
        farms: [{ _id: 'farm1', userId: 'user1' }]
      });
      localDb.writeDb.mockReturnValue(true);

      const response = await request(app)
        .post('/api/soil/readings')
        .send({
          farmId: 'farm1',
          nitrogen: 5, // Very low
          phosphorus: 5,
          potassium: 5,
          pH: 3, // Very acidic
          moisture: 5,
          temperature: 35
        });

      const rating = response.body.data.reading.rating;
      expect(['Poor', 'Fair']).toContain(rating);
    });
  });

  describe('Error Handling', () => {
    it('should handle farm not found', async () => {
      localDb.readDb.mockReturnValue({
        soilreadings: [],
        farms: []
      });

      const response = await request(app)
        .post('/api/soil/readings')
        .send({
          farmId: 'nonexistent',
          nitrogen: 50,
          phosphorus: 40,
          potassium: 60,
          pH: 6.5,
          moisture: 60,
          temperature: 25
        });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND_ERROR');
    });

    it('should return standardized error format', async () => {
      const response = await request(app)
        .post('/api/soil/readings')
        .send({
          farmId: 'farm1'
          // Missing required fields
        });

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('statusCode');
      expect(response.body.error).toHaveProperty('timestamp');
    });
  });
});
