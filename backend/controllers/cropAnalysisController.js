/**
 * Enhanced Crop Analysis Controller
 * Integrates image analysis with market intelligence
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const marketIntelligence = require('../services/marketIntelligenceService');
const { formatCurrency, extractCropFromImage } = require('../utils/helpers');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

/**
 * POST /api/crops/analyze-image
 * Upload and analyze crop image with market recommendations
 */
exports.analyzeImageWithMarketData = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { farmId, area = 1 } = req.body;
    const imageBuffer = req.file.buffer;
    const fileName = req.file.filename;

    // Step 1: Send to ML service for crop identification
    console.log('📸 Analyzing image...');
    let imageAnalysis;
    try {
      const formData = new FormData();
      const blob = new Blob([imageBuffer], { type: req.file.mimetype });
      formData.append('image', blob, fileName);

      const mlResponse = await axios.post(
        `${ML_SERVICE_URL}/crops/analyze-image`,
        formData,
        {
          headers: formData.getHeaders ? formData.getHeaders() : { 'Content-Type': 'multipart/form-data' },
          timeout: 30000
        }
      );

      imageAnalysis = mlResponse.data;
    } catch (mlError) {
      console.error('ML Service error:', mlError.message);
      // Fallback: extract crop name from file or use generic analysis
      imageAnalysis = {
        suggestedCrops: ['rice', 'wheat'],
        healthScore: 0.7,
        issues: ['Needs detailed ML analysis'],
        confidence: 0.5
      };
    }

    console.log('📊 Fetching market data...');
    // Step 2: Get market intelligence for recommended crops
    const marketRecommendations = await marketIntelligence.analyzeImageAndRecommend(
      imageAnalysis,
      parseFloat(area)
    );

    console.log('💹 Calculating profit analysis...');
    // Step 3: Detailed profit breakdown
    const profitAnalysis = {
      crops: marketRecommendations.recommendations.map(rec => ({
        name: rec.crop,
        expectedRevenue: rec.profitAnalysis?.revenue,
        estimatedCost: rec.profitAnalysis?.cost,
        netProfit: rec.profitAnalysis?.profit,
        roi: rec.profitAnalysis?.roi,
        investmentScore: rec.investmentScore
      }))
    };

    // Step 4: Get current season recommendations
    const seasonalRecs = marketIntelligence.getSeasonalRecommendations();
    const currentSeason = marketIntelligence.getCurrentSeason();

    // Step 5: Build comprehensive response
    const response = {
      imageAnalysis: {
        suggestedCrops: imageAnalysis.suggestedCrops,
        healthScore: imageAnalysis.healthScore,
        issues: imageAnalysis.issues,
        confidence: imageAnalysis.confidence
      },
      marketRecommendations: {
        topChoice: marketRecommendations.topChoice,
        allOptions: marketRecommendations.recommendations.map(rec => ({
          crop: rec.crop,
          profitAnalysis: marketIntelligence.formatProfitAnalysis(rec.profitAnalysis),
          marketSentiment: rec.marketIntelligence.sentiment,
          confidenceLevel: rec.marketIntelligence.confidence,
          investmentScore: `${rec.investmentScore}/100`,
          recommendation: rec.recommendation
        }))
      },
      profitAnalysis: {
        area: `${area} hectare(s)`,
        crops: profitAnalysis.crops.map(crop => ({
          name: crop.name,
          expectedRevenue: `₹${crop.expectedRevenue?.toLocaleString('en-IN') || 'N/A'}`,
          estimatedCost: `₹${crop.estimatedCost?.toLocaleString('en-IN') || 'N/A'}`,
          netProfit: `₹${crop.netProfit?.toLocaleString('en-IN') || 'N/A'}`,
          roi: crop.roi || 'N/A',
          investmentScore: `${crop.investmentScore}/100`
        }))
      },
      seasonalContext: {
        currentMonth: currentSeason.month,
        currentSeason: currentSeason.season,
        bestCropsNow: seasonalRecs.map(s => ({
          crop: s.crop,
          plantingMonth: s.plantingMonth,
          season: s.season,
          months: s.months
        }))
      },
      insights: generateInsights(marketRecommendations, currentSeason),
      lastUpdated: new Date()
    };

    res.json(response);
  } catch (error) {
    console.error('Error in crop analysis:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to analyze image and fetch market data'
    });
  }
};

/**
 * GET /api/crops/market-data/:cropName
 * Get current market data and news for a specific crop
 */
exports.getCropMarketData = async (req, res) => {
  try {
    const { cropName } = req.params;
    const { area = 1 } = req.query;

    // Fetch news
    const news = await marketIntelligence.fetchAgriculturalNews(cropName, 5);

    // Search prices
    const priceSearch = await marketIntelligence.searchCropPrices(cropName);

    // Get profit estimate
    const profit = marketIntelligence.estimateProfit(cropName, parseFloat(area));

    // Get seasonal info
    const seasonal = marketIntelligence.CROP_SEASONS[cropName.toLowerCase()];

    res.json({
      crop: cropName,
      news: news.map(n => ({
        title: n.title,
        source: n.source,
        publishedAt: n.publishedAt,
        url: n.url
      })),
      recentPriceSearches: priceSearch,
      profitEstimate: marketIntelligence.formatProfitAnalysis(profit),
      seasonalInfo: seasonal,
      area
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/crops/best-investment
 * Get current best crops to invest/plant based on market data
 */
exports.getBestInvestment = async (req, res) => {
  try {
    const { area = 1 } = req.query;
    
    // Get all crops with seasonal match
    const allCrops = Object.keys(marketIntelligence.CROPS);
    const seasonalRecs = marketIntelligence.getSeasonalRecommendations();
    const trends = await marketIntelligence.getMarketTrends(
      seasonalRecs.map(r => r.cropId)
    );

    // Score and rank
    const rankings = seasonalRecs.map(rec => {
      const profit = marketIntelligence.estimateProfit(rec.cropId, parseFloat(area));
      const marketData = trends[rec.cropId] || {};
      const score = marketIntelligence.calculateInvestmentScore(profit, marketData, rec);

      return {
        crop: rec.crop,
        score,
        profitEstimate: marketIntelligence.formatProfitAnalysis(profit),
        marketSentiment: marketData.sentiment || 'neutral',
        seasonal: rec
      };
    }).sort((a, b) => b.score - a.score);

    res.json({
      currentSeason: marketIntelligence.getCurrentSeason(),
      area: `${area} hectare(s)`,
      topInvestments: rankings.slice(0, 5),
      allOptions: rankings,
      updateTime: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/crops/compare
 * Compare multiple crops for investment potential
 */
exports.compareCrops = async (req, res) => {
  try {
    const { crops, area = 1 } = req.body;

    if (!crops || crops.length === 0) {
      return res.status(400).json({ error: 'Please provide crops to compare' });
    }

    const trends = await marketIntelligence.getMarketTrends(crops);
    const seasonalRecs = marketIntelligence.getSeasonalRecommendations();

    const comparison = crops.map(cropName => {
      const profit = marketIntelligence.estimateProfit(cropName, parseFloat(area));
      const marketData = trends[cropName] || {};
      const seasonal = seasonalRecs.find(
        r => r.crop.toLowerCase() === cropName.toLowerCase()
      );
      const score = marketIntelligence.calculateInvestmentScore(profit, marketData, seasonal);

      return {
        crop: cropName,
        profitAnalysis: marketIntelligence.formatProfitAnalysis(profit),
        marketIntelligence: {
          sentiment: marketData.sentiment || 'neutral',
          confidence: (marketData.confidence * 100).toFixed(1) + '%',
          trend: marketData.sentiment === 'bullish' ? '📈' : marketData.sentiment === 'bearish' ? '📉' : '➡️'
        },
        seasonalFit: seasonal?.timing || 'OFF-SEASON',
        investmentScore: `${score}/100`,
        recommendation: score > 70 ? '✅ STRONGLY RECOMMENDED' : score > 50 ? '✓ RECOMMENDED' : '⚠️ CAUTION'
      };
    });

    // Sort by investment score
    comparison.sort((a, b) => {
      const scoreA = parseInt(a.investmentScore.split('/')[0]);
      const scoreB = parseInt(b.investmentScore.split('/')[0]);
      return scoreB - scoreA;
    });

    res.json({
      area: `${area} hectare(s)`,
      comparison,
      recommendation: comparison[0],
      analysisDate: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Generate human-readable insights
 */
function generateInsights(marketRecommendations, currentSeason) {
  const insights = [];

  // Top choice insight
  if (marketRecommendations.topChoice) {
    const top = marketRecommendations.topChoice;
    const profit = top.profitAnalysis;
    
    insights.push({
      type: 'TOP_CHOICE',
      title: `${top.crop} - Best Option`,
      message: `Based on current market conditions and season, ${top.crop} is your best choice with an estimated profit of ₹${profit?.profit?.toLocaleString('en-IN') || 'TBD'} and ${profit?.roi || 'strong'} ROI.`
    });
  }

  // Market sentiment insight
  const bullishCrops = marketRecommendations.recommendations.filter(
    r => r.marketIntelligence.sentiment === 'bullish'
  );
  if (bullishCrops.length > 0) {
    insights.push({
      type: 'MARKET_TREND',
      title: '📈 Bullish Market',
      message: `${bullishCrops.map(r => r.crop).join(', ')} showing strong market demand and rising prices.`
    });
  }

  // Seasonal insight
  insights.push({
    type: 'SEASONAL',
    title: `${currentSeason.season} Season - ${currentSeason.month}`,
    message: `Perfect time for ${currentSeason.season} crops. Consider planting within the next 2-4 weeks for optimal yield.`
  });

  // Risk warning
  const riskyCrops = marketRecommendations.recommendations.filter(
    r => r.marketIntelligence.sentiment === 'bearish'
  );
  if (riskyCrops.length > 0) {
    insights.push({
      type: 'RISK_WARNING',
      title: '⚠️ Market Caution',
      message: `${riskyCrops.map(r => r.crop).join(', ')} showing weak market sentiment. Proceed with caution.`
    });
  }

  return insights;
};
