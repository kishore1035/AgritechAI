const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const predictionsController = require('../controllers/predictionsController');

router.use(authMiddleware);

// Nutrient deficiency prediction
router.post('/nutrient-deficiency', predictionsController.predictNutrientDeficiency);

// Soil health scoring
router.post('/soil-health', predictionsController.predictSoilHealth);

// Crop yield prediction
router.post('/crop-yield', predictionsController.predictCropYield);

// Disease risk prediction
router.post('/disease-risk', predictionsController.predictDiseaseRisk);

// Comprehensive crop recommendation
router.post('/recommendation', predictionsController.getComprehendiveRecommendation);

// ML service health check
router.get('/health/ml-service', predictionsController.checkMLServiceHealth);

module.exports = router;
