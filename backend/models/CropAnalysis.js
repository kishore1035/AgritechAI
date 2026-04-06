if (process.env.LOCAL_DB === 'true') {
  const { createLocalModel } = require('../config/localDb');
  module.exports = createLocalModel('cropAnalyses', { timestamps: true });
} else {
  const mongoose = require('mongoose');

  const cropAnalysisSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    farmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm' },
    imageFileName: { type: String, required: true },
    imagePath: { type: String, required: true },
    
    // Analysis Results
    cropName: { type: String, required: true },
    healthScore: { type: Number, min: 0, max: 100, required: true },
    ripeness: { type: Number, min: 0, max: 100 },
    growthStage: String,
    
    // Harvest info
    daysToHarvest: Number,
    harvestDate: Date,
    
    // Issues & recommendations
    detectedIssues: [{
      name: String,
      severity: { type: String, enum: ['low', 'medium', 'high'] },
      description: String
    }],
    maintenanceTips: [String],
    
    // Raw analysis data
    rawAnalysis: mongoose.Schema.Types.Mixed,
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });

  module.exports = mongoose.model('CropAnalysis', cropAnalysisSchema);
}
