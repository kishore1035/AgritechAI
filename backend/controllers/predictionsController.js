/**
 * Predictions Controller
 * Handles crop predictions and analysis using ML service
 * 
 * @typedef {Object} PredictionRequest
 * @property {number} nitrogen - Nitrogen level (0-500)
 * @property {number} phosphorus - Phosphorus level (0-500)
 * @property {number} potassium - Potassium level (0-500)
 * @property {number} pH - Soil pH (4-9)
 * @property {number} moisture - Soil moisture (0-100%)
 * @property {number} temperature - Temperature (-40 to 60°C)
 * 
 * @typedef {Object} PredictionResponse
 * @property {boolean} success - Success status
 * @property {Object} data - Response data
 * @property {Object} [data.prediction] - Prediction results
 * @property {number} [data.confidence] - Confidence score (0-1)
 */

const axios = require('axios');
const { ExternalServiceError, TimeoutError, ValidationError } = require('../utils/AppError');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';
const ML_SERVICE_TIMEOUT = parseInt(process.env.ML_SERVICE_TIMEOUT || '8000');

/**
 * Create axios instance with timeout
 * @type {import('axios').AxiosInstance}
 */
const mlService = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: ML_SERVICE_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Handle ML service errors with proper fallbacks
 * @param {Error} error - The error object
 * @throws {TimeoutError|ExternalServiceError}
 */
mlService.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED') {
      throw new TimeoutError('ML Service', ML_SERVICE_TIMEOUT);
    }
    if (error.response) {
      throw new ExternalServiceError('ML Service', error.response.statusText, {
        status: error.response.status
      });
    }
    throw new ExternalServiceError('ML Service', error.message);
  }
);

/**
 * Predict nutrient deficiency
 * @param {Object} req - Express request object
 * @param {PredictionRequest} req.body - Request body with soil parameters
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Returns JSON with deficiency predictions
 * @throws {ValidationError} If soil parameters are invalid
 * @throws {TimeoutError} If ML service times out
 * @throws {ExternalServiceError} If ML service is unavailable
 */
exports.predictNutrientDeficiency = async (req, res, next) => {
  try {
    const { nitrogen, phosphorus, potassium, pH, moisture, temperature } = req.body;

    // Validate inputs
    if (nitrogen === undefined || phosphorus === undefined || potassium === undefined) {
      throw new ValidationError('Missing required nutrient values', {
        required: ['nitrogen', 'phosphorus', 'potassium']
      });
    }

    if (pH < 4 || pH > 9) {
      throw new ValidationError('pH must be between 4 and 9');
    }

    if (moisture < 0 || moisture > 100) {
      throw new ValidationError('Moisture must be between 0 and 100');
    }

    if (temperature < -40 || temperature > 60) {
      throw new ValidationError('Temperature must be between -40 and 60');
    }

    // Call ML service
    const response = await mlService.post('/predict/nutrient-depletion', {
      nitrogen,
      phosphorus,
      potassium,
      pH,
      moisture,
      temperature
    });

    res.json({
      success: true,
      data: {
        prediction: response.data,
        confidence: response.data.confidence || 0.85,
        recommendations: response.data.recommendations || []
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Predict soil health score
 */
exports.predictSoilHealth = async (req, res, next) => {
  try {
    const { nitrogen, phosphorus, potassium, pH, moisture, organicMatter } = req.body;

    // Validate inputs
    if (!nitrogen || !phosphorus || !potassium) {
      throw new ValidationError('Missing required soil parameters');
    }

    // Call ML service
    const response = await mlService.post('/soil/score', {
      nitrogen,
      phosphorus,
      potassium,
      pH: pH || 6.5,
      moisture: moisture || 50,
      organicMatter: organicMatter || 3
    });

    res.json({
      success: true,
      data: {
        healthScore: response.data.score || 0,
        rating: response.data.rating || 'moderate',
        improvements: response.data.improvements || [],
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Predict crop yield
 */
exports.predictCropYield = async (req, res, next) => {
  try {
    const { cropName, area, nitrogen, phosphorus, potassium, rainfall, temperature } = req.body;

    // Validate inputs
    if (!cropName || !area) {
      throw new ValidationError('Missing required fields: cropName, area');
    }

    if (area <= 0 || area > 10000) {
      throw new ValidationError('Area must be between 0.1 and 10000 hectares');
    }

    // Call ML service
    const response = await mlService.post('/predict/crop-yield', {
      cropName,
      area,
      nitrogen: nitrogen || 0,
      phosphorus: phosphorus || 0,
      potassium: potassium || 0,
      rainfall: rainfall || 600,
      temperature: temperature || 25
    });

    res.json({
      success: true,
      data: {
        estimatedYield: response.data.yield || 0,
        unit: 'kg/hectare',
        confidence: response.data.confidence || 0.75,
        factors: response.data.factors || {},
        recommendations: response.data.recommendations || []
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Predict disease risk
 */
exports.predictDiseaseRisk = async (req, res, next) => {
  try {
    const { cropName, temperature, humidity, rainfall } = req.body;

    // Validate inputs
    if (!cropName) {
      throw new ValidationError('Crop name is required');
    }

    if (temperature < -40 || temperature > 60) {
      throw new ValidationError('Invalid temperature range');
    }

    if (humidity < 0 || humidity > 100) {
      throw new ValidationError('Humidity must be between 0 and 100');
    }

    // Call ML service
    const response = await mlService.post('/predict/disease-risk', {
      cropName,
      temperature,
      humidity,
      rainfall: rainfall || 0
    });

    res.json({
      success: true,
      data: {
        riskLevel: response.data.riskLevel || 'low',
        riskScore: response.data.riskScore || 0,
        potentialDiseases: response.data.diseases || [],
        preventionMeasures: response.data.preventionMeasures || [],
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get comprehensive crop recommendation
 */
exports.getComprehendiveRecommendation = async (req, res, next) => {
  try {
    const { farmArea, soilData, weatherData, cropPreferences } = req.body;

    // Validate inputs
    if (!farmArea || farmArea <= 0) {
      throw new ValidationError('Valid farm area is required');
    }

    // Call ML service with comprehensive analysis
    const response = await mlService.post('/predict/comprehensive-recommendation', {
      farmArea,
      soilData: soilData || {},
      weatherData: weatherData || {},
      cropPreferences: cropPreferences || []
    });

    res.json({
      success: true,
      data: {
        recommendedCrops: response.data.crops || [],
        bestCrop: response.data.bestCrop || null,
        profitProjection: response.data.profitProjection || {},
        riskFactors: response.data.risks || [],
        seasonalPlan: response.data.seasonalPlan || []
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Health check for ML service
 */
exports.checkMLServiceHealth = async (req, res, next) => {
  try {
    const response = await mlService.get('/health');

    res.json({
      success: true,
      data: {
        mlService: {
          status: response.data.status || 'operational',
          version: response.data.version,
          uptime: response.data.uptime,
          timestamp: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      data: {
        mlService: {
          status: 'unavailable',
          timestamp: new Date().toISOString()
        }
      }
    });
  }
};
