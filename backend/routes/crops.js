const express = require('express');
const router = express.Router();
const Crop = require('../models/Crop');
const auth = require('../middleware/auth');
const multer = require('multer');
const cropAnalysisController = require('../controllers/cropAnalysisController');

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

/**
 * POST /api/crops/analyze-image
 * Upload image and get crop analysis with market recommendations
 */
router.post(
  '/analyze-image',
  auth,
  upload.single('image'),
  cropAnalysisController.analyzeImageWithMarketData
);

/**
 * GET /api/crops/market-data/:cropName
 * Get market data for a specific crop
 */
router.get(
  '/market-data/:cropName',
  auth,
  cropAnalysisController.getCropMarketData
);

/**
 * GET /api/crops/best-investment
 * Get best crops to invest based on current market conditions
 */
router.get(
  '/best-investment',
  auth,
  cropAnalysisController.getBestInvestment
);

/**
 * POST /api/crops/compare
 * Compare multiple crops for investment potential
 */
router.post(
  '/compare',
  auth,
  cropAnalysisController.compareCrops
);

// Get all crops
router.get('/', async (req, res) => {
  try {
    const crops = await Crop.find();
    res.json(crops);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get crops by region
router.get('/region/:region', async (req, res) => {
  try {
    const crops = await Crop.find({ suitableRegions: req.params.region });
    res.json(crops);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
