/**
 * Predictions Controller Unit Tests
 * Tests ML service integration and predictions endpoints
 */

const predictionsController = require('../../controllers/predictionsController');
const { TimeoutError, ValidationError, ExternalServiceError } = require('../../utils/AppError');

jest.mock('axios');
const axios = require('axios');

describe('Predictions Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {},
      user: { _id: 'user1', phone: '9998887776' }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };

    next = jest.fn();
  });

  describe('predictNutrientDeficiency', () => {
    it('should predict nutrient deficiency with valid input', async () => {
      req.body = {
        nitrogen: 45,
        phosphorus: 35,
        potassium: 55,
        pH: 6.5,
        moisture: 60,
        temperature: 25
      };

      axios.create().post = jest.fn().mockResolvedValue({
        data: {
          deficiencies: ['nitrogen'],
          severity: 'mild',
          recommendations: [{ nutrient: 'nitrogen', dosage: '100kg/hectare' }]
        }
      });

      await predictionsController.predictNutrientDeficiency(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(true);
      expect(response.data.prediction).toBeDefined();
      expect(response.data.confidence).toBeDefined();
    });

    it('should reject invalid nitrogen value', async () => {
      req.body = {
        nitrogen: -50, // Invalid negative value
        phosphorus: 35,
        potassium: 55,
        pH: 6.5,
        moisture: 60,
        temperature: 25
      };

      await predictionsController.predictNutrientDeficiency(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should reject invalid pH range', async () => {
      req.body = {
        nitrogen: 45,
        phosphorus: 35,
        potassium: 55,
        pH: 12, // Invalid pH > 9
        moisture: 60,
        temperature: 25
      };

      await predictionsController.predictNutrientDeficiency(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should handle ML service timeout', async () => {
      req.body = {
        nitrogen: 45,
        phosphorus: 35,
        potassium: 55,
        pH: 6.5,
        moisture: 60,
        temperature: 25
      };

      axios.create().post = jest.fn().mockRejectedValue({
        code: 'ECONNABORTED',
        message: 'timeout'
      });

      await predictionsController.predictNutrientDeficiency(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(TimeoutError));
    });

    it('should handle ML service unavailable', async () => {
      req.body = {
        nitrogen: 45,
        phosphorus: 35,
        potassium: 55,
        pH: 6.5,
        moisture: 60,
        temperature: 25
      };

      axios.create().post = jest.fn().mockRejectedValue({
        response: {
          status: 503,
          statusText: 'Service Unavailable'
        }
      });

      await predictionsController.predictNutrientDeficiency(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ExternalServiceError));
    });
  });

  describe('predictSoilHealth', () => {
    it('should score soil health with valid input', async () => {
      req.body = {
        nitrogen: 50,
        phosphorus: 40,
        potassium: 60,
        pH: 6.5,
        moisture: 60,
        organicMatter: 3.5
      };

      axios.create().post = jest.fn().mockResolvedValue({
        data: {
          score: 75,
          rating: 'Good',
          improvements: ['Increase organic matter']
        }
      });

      await predictionsController.predictSoilHealth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.healthScore).toBe(75);
      expect(response.data.rating).toBe('Good');
    });

    it('should use defaults for missing optional parameters', async () => {
      req.body = {
        nitrogen: 50,
        phosphorus: 40,
        potassium: 60
      };

      axios.create().post = jest.fn().mockResolvedValue({
        data: { score: 65, rating: 'Moderate' }
      });

      await predictionsController.predictSoilHealth(req, res, next);

      // Verify defaults were applied
      const callArgs = axios.create().post.mock.calls[0][1];
      expect(callArgs.pH).toBe(6.5); // Default
      expect(callArgs.moisture).toBe(50); // Default
    });

    it('should reject missing critical parameters', async () => {
      req.body = {
        nitrogen: 50,
        phosphorus: 40
        // Missing potassium
      };

      await predictionsController.predictSoilHealth(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });

  describe('predictCropYield', () => {
    it('should predict crop yield with valid input', async () => {
      req.body = {
        cropName: 'rice',
        area: 2.5,
        nitrogen: 50,
        phosphorus: 40,
        potassium: 60,
        rainfall: 800,
        temperature: 25
      };

      axios.create().post = jest.fn().mockResolvedValue({
        data: {
          yield: 5800,
          confidence: 0.85,
          factors: { climate: 0.85, soil: 0.80 },
          recommendations: ['Apply irrigation']
        }
      });

      await predictionsController.predictCropYield(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.estimatedYield).toBe(5800);
      expect(response.data.unit).toBe('kg/hectare');
    });

    it('should reject invalid area', async () => {
      req.body = {
        cropName: 'rice',
        area: 0, // Invalid area
        nitrogen: 50
      };

      await predictionsController.predictCropYield(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should reject area exceeding limit', async () => {
      req.body = {
        cropName: 'rice',
        area: 15000, // Exceeds 10000 limit
        nitrogen: 50
      };

      await predictionsController.predictCropYield(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });

  describe('predictDiseaseRisk', () => {
    it('should assess disease risk with valid input', async () => {
      req.body = {
        cropName: 'wheat',
        temperature: 22,
        humidity: 75,
        rainfall: 120
      };

      axios.create().post = jest.fn().mockResolvedValue({
        data: {
          riskLevel: 'moderate',
          riskScore: 65,
          diseases: [
            { disease: 'Powdery Mildew', probability: 0.72 }
          ],
          preventionMeasures: ['Spray fungicide']
        }
      });

      await predictionsController.predictDiseaseRisk(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.riskLevel).toBeDefined();
      expect(response.data.potentialDiseases).toBeDefined();
    });

    it('should reject invalid humidity', async () => {
      req.body = {
        cropName: 'wheat',
        temperature: 22,
        humidity: 150, // Invalid > 100
        rainfall: 120
      };

      await predictionsController.predictDiseaseRisk(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should reject invalid temperature', async () => {
      req.body = {
        cropName: 'wheat',
        temperature: 100, // Invalid > 60
        humidity: 75,
        rainfall: 120
      };

      await predictionsController.predictDiseaseRisk(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });

  describe('checkMLServiceHealth', () => {
    it('should return ML service status when operational', async () => {
      axios.create().get = jest.fn().mockResolvedValue({
        data: {
          status: 'operational',
          version: '1.0',
          uptime: 3600
        }
      });

      await predictionsController.checkMLServiceHealth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.mlService.status).toBe('operational');
    });

    it('should handle ML service unavailable gracefully', async () => {
      axios.create().get = jest.fn().mockRejectedValue(
        new Error('Connection refused')
      );

      await predictionsController.checkMLServiceHealth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(503);
      const response = res.json.mock.calls[0][0];
      expect(response.data.mlService.status).toBe('unavailable');
    });
  });

  describe('Error Response Format', () => {
    it('should return standardized error format on timeout', async () => {
      req.body = {
        nitrogen: 45,
        phosphorus: 35,
        potassium: 55,
        pH: 6.5,
        moisture: 60,
        temperature: 25
      };

      axios.create().post = jest.fn().mockRejectedValue({
        code: 'ECONNABORTED'
      });

      await predictionsController.predictNutrientDeficiency(req, res, next);

      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(504);
      expect(error.errorCode).toBe('TIMEOUT_ERROR');
      expect(error.toJSON).toBeDefined();
    });
  });
});
