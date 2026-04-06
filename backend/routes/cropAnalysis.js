const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const axios = require('axios');
const auth = require('../middleware/auth');
const CropAnalysis = require('../models/CropAnalysis');

// ── Multer setup ───────────────────────────────────
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `crop-${timestamp}-${Math.random().toString(36).substr(2, 9)}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// ── POST /api/crops/analyze ────────────────────────
router.post('/analyze', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const userId = req.user.id;
    const farmId = req.body.farmId || null;
    const imagePath = path.join('uploads', req.file.filename);
    const fullImagePath = path.join(uploadsDir, req.file.filename);

    // Convert image to base64
    const imageBuffer = fs.readFileSync(fullImagePath);
    const base64Image = imageBuffer.toString('base64');

    // Call ML service
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001';
    
    let analysisResult;
    try {
      const response = await axios.post(`${mlServiceUrl}/predict/crop-analysis`, {
        image: base64Image,
        mediaType: req.file.mimetype
      }, {
        timeout: 60000 // 60 second timeout
      });
      analysisResult = response.data;
    } catch (mlError) {
      // Clean up uploaded file on ML service error
      fs.unlinkSync(fullImagePath);
      console.error('ML Service error:', mlError.message);
      return res.status(503).json({
        error: 'Image analysis service temporarily unavailable',
        details: process.env.NODE_ENV === 'development' ? mlError.message : undefined
      });
    }

    // Create analysis record
    const analysis = await CropAnalysis.create({
      userId,
      farmId,
      imageFileName: req.file.filename,
      imagePath,
      cropName: analysisResult.cropName,
      healthScore: analysisResult.healthScore,
      ripeness: analysisResult.ripeness,
      growthStage: analysisResult.growthStage,
      daysToHarvest: analysisResult.daysToHarvest,
      harvestDate: analysisResult.harvestDate,
      detectedIssues: analysisResult.detectedIssues || [],
      maintenanceTips: analysisResult.maintenanceTips || [],
      rawAnalysis: analysisResult
    });

    res.json({
      success: true,
      analysisId: analysis._id || analysis.id,
      data: {
        cropName: analysis.cropName,
        healthScore: analysis.healthScore,
        ripeness: analysis.ripeness,
        growthStage: analysis.growthStage,
        daysToHarvest: analysis.daysToHarvest,
        harvestDate: analysis.harvestDate,
        detectedIssues: analysis.detectedIssues,
        maintenanceTips: analysis.maintenanceTips,
        timestamp: analysis.createdAt
      }
    });
  } catch (error) {
    console.error('Crop analysis error:', error);
    if (req.file) {
      const fullPath = path.join(uploadsDir, req.file.filename);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
    res.status(500).json({
      error: 'Failed to analyze crop image',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ── GET /api/crops/analyses ────────────────────────
router.get('/analyses', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const analyses = await CropAnalysis.find({ userId })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: analyses.map(a => ({
        id: a._id || a.id,
        cropName: a.cropName,
        healthScore: a.healthScore,
        ripeness: a.ripeness,
        daysToHarvest: a.daysToHarvest,
        detectedIssues: a.detectedIssues,
        timestamp: a.createdAt,
        farmId: a.farmId
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/crops/analyses/:analysisId ───────────
router.get('/analyses/:analysisId', auth, async (req, res) => {
  try {
    const analysis = await CropAnalysis.findOne({
      _id: req.params.analysisId || req.params.analysisId,
      userId: req.user.id
    });
    
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json({
      success: true,
      data: {
        id: analysis._id || analysis.id,
        cropName: analysis.cropName,
        healthScore: analysis.healthScore,
        ripeness: analysis.ripeness,
        growthStage: analysis.growthStage,
        daysToHarvest: analysis.daysToHarvest,
        harvestDate: analysis.harvestDate,
        detectedIssues: analysis.detectedIssues,
        maintenanceTips: analysis.maintenanceTips,
        timestamp: analysis.createdAt,
        farmId: analysis.farmId
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/crops/analyses/:analysisId/link-farm ─
router.post('/analyses/:analysisId/link-farm', auth, async (req, res) => {
  try {
    const { farmId } = req.body;
    
    const analysis = await CropAnalysis.findOneAndUpdate(
      { _id: req.params.analysisId, userId: req.user.id },
      { farmId },
      { new: true }
    );
    
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
