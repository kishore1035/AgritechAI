/**
 * Crop Rotation Optimization Routes
 * Endpoints for genetic algorithm-based crop rotation planning
 */

const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { spawn } = require('child_process');
const path = require('path');

/**
 * POST /api/crop-rotation/optimize
 * Generate optimized crop rotation plans using genetic algorithm
 * 
 * Body: {
 *   years: number (2-5),
 *   num_crops: number (1-4),
 *   soil_type: string ('loam', 'clay', 'sandy'),
 *   market_prices: object (optional)
 * }
 */
router.post('/optimize', authMiddleware, async (req, res) => {
  try {
    const { years = 3, num_crops = 3, soil_type = 'loam', market_prices = {} } = req.body;

    // Validate inputs
    if (years < 2 || years > 5) {
      return res.status(400).json({ error: 'Years must be between 2-5' });
    }
    if (num_crops < 1 || num_crops > 4) {
      return res.status(400).json({ error: 'Number of crops must be between 1-4' });
    }
    if (!['loam', 'clay', 'sandy'].includes(soil_type)) {
      return res.status(400).json({ error: 'Invalid soil type. Use: loam, clay, or sandy' });
    }

    // Call ML service Python GA
    const results = await callCropRotationGA({
      years,
      num_crops,
      soil_type,
      market_prices
    });

    res.json({
      success: true,
      data: results,
      metadata: {
        years,
        num_crops,
        soil_type,
        generated_at: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Crop rotation optimization error:', err);
    res.status(500).json({ error: 'Failed to optimize crop rotation' });
  }
});

/**
 * POST /api/crop-rotation/recommend-next-crop
 * Recommend next year's crop based on current soil conditions
 * 
 * Body: {
 *   current_soil: { nitrogen, phosphorus, potassium, ph },
 *   last_crop: string,
 *   market_prices: object (optional)
 * }
 */
router.post('/recommend-next-crop', authMiddleware, async (req, res) => {
  try {
    const { current_soil = {}, last_crop = '' } = req.body;

    // Validate inputs
    if (!last_crop) {
      return res.status(400).json({ error: 'Last crop is required' });
    }

    // Call ML service for recommendation
    const recommendation = await callCropRecommendation({
      current_soil,
      last_crop
    });

    res.json({
      success: true,
      data: recommendation,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Crop recommendation error:', err);
    res.status(500).json({ error: 'Failed to recommend next crop' });
  }
});

/**
 * GET /api/crop-rotation/database
 * Get crop database with requirements and characteristics
 */
router.get('/database', authMiddleware, async (req, res) => {
  try {
    const cropDatabase = {
      'Wheat': {
        yield: 85,
        nitrogen: -10,
        phosphorus: 5,
        potassium: 10,
        soil_type: ['loam', 'clay'],
        season: 'winter',
        temp_range: '5-25°C',
        rainfall: '500-750mm',
        duration: '120-150 days'
      },
      'Rice': {
        yield: 90,
        nitrogen: -5,
        phosphorus: 8,
        potassium: 12,
        soil_type: ['clay', 'loam'],
        season: 'summer',
        temp_range: '20-30°C',
        rainfall: '800-1500mm',
        duration: '120-150 days'
      },
      'Pulses': {
        yield: 60,
        nitrogen: 30,
        phosphorus: 10,
        potassium: 8,
        soil_type: ['loam', 'sandy'],
        season: 'winter',
        temp_range: '15-25°C',
        rainfall: '400-700mm',
        duration: '90-120 days'
      },
      'Maize': {
        yield: 80,
        nitrogen: -15,
        phosphorus: 6,
        potassium: 12,
        soil_type: ['loam'],
        season: 'summer',
        temp_range: '18-27°C',
        rainfall: '500-800mm',
        duration: '100-140 days'
      },
      'Cotton': {
        yield: 70,
        nitrogen: -20,
        phosphorus: 4,
        potassium: 8,
        soil_type: ['loam', 'sandy'],
        season: 'summer',
        temp_range: '15-35°C',
        rainfall: '600-1000mm',
        duration: '180-220 days'
      },
      'Groundnut': {
        yield: 65,
        nitrogen: 20,
        phosphorus: 12,
        potassium: 10,
        soil_type: ['sandy', 'loam'],
        season: 'summer',
        temp_range: '20-30°C',
        rainfall: '500-800mm',
        duration: '120-150 days'
      },
      'Sugarcane': {
        yield: 95,
        nitrogen: -25,
        phosphorus: 8,
        potassium: 15,
        soil_type: ['loam', 'clay'],
        season: 'year-round',
        temp_range: '15-30°C',
        rainfall: '1200-1500mm',
        duration: '300-360 days'
      },
      'Soybean': {
        yield: 75,
        nitrogen: 25,
        phosphorus: 10,
        potassium: 12,
        soil_type: ['loam'],
        season: 'summer',
        temp_range: '18-30°C',
        rainfall: '450-700mm',
        duration: '100-140 days'
      }
    };

    res.json({
      success: true,
      data: cropDatabase,
      total_crops: Object.keys(cropDatabase).length
    });
  } catch (err) {
    console.error('Error fetching crop database:', err);
    res.status(500).json({ error: 'Failed to fetch crop database' });
  }
});

/**
 * Helper: Call Python GA module
 */
async function callCropRotationGA(params) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', [
      path.join(__dirname, '../crop_rotation_ga.py'),
      JSON.stringify(params)
    ]);

    let output = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python GA error:', error);
        return reject(new Error('GA optimization failed'));
      }

      try {
        const results = JSON.parse(output);
        resolve(results);
      } catch (e) {
        reject(new Error('Invalid GA output format'));
      }
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      pythonProcess.kill();
      reject(new Error('GA optimization timeout'));
    }, 30000);
  });
}

/**
 * Helper: Call crop recommendation
 */
async function callCropRecommendation(params) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', [
      path.join(__dirname, '../crop_rotation_ga.py'),
      '--recommend',
      JSON.stringify(params)
    ]);

    let output = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error('Recommendation failed'));
      }

      try {
        const result = JSON.parse(output);
        resolve(result);
      } catch (e) {
        reject(new Error('Invalid recommendation output'));
      }
    });

    setTimeout(() => {
      pythonProcess.kill();
      reject(new Error('Recommendation timeout'));
    }, 10000);
  });
}

module.exports = router;
