const Farm        = require('../models/Farm');
const SoilReading = require('../models/SoilReading');
const Alert       = require('../models/Alert');
const CropAnalysis = require('../models/CropAnalysis');
const { fetchWeather } = require('../services/weatherService');
const { cacheGet, cacheSet } = require('../config/redis');

/**
 * GET /api/dashboard
 *
 * Single aggregated endpoint powering the Home Dashboard screen.
 * Combines: farm summary, latest soil, weather, alerts, crop stage.
 *
 * Cache: 5 minutes per user (weather refreshes independently).
 */
exports.getDashboard = async (req, res) => {
  try {
    const cacheKey = `dashboard:${req.userId}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json({ ...cached, fromCache: true });

    // Run all DB queries in parallel
    const [farm, unreadAlerts, recentAlerts] = await Promise.all([
      Farm.findOne({ userId: req.userId }).sort({ createdAt: -1 }),
      Alert.countDocuments({ userId: req.userId, isRead: false }),
      Alert.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .limit(10) // Increased limit for more comprehensive data
        .select('type severity title message action createdAt source'),
    ]);

    // Latest soil reading (separate query to allow null farm)
    const soilReading = farm
      ? await SoilReading.findOne({ farmId: farm._id }).sort({ readingDate: -1 })
      : null;

    // Farm health score calculation
    const healthScore = computeHealthScore(soilReading, farm);

    // Weather (fast because cached in WeatherCache / Redis)
    let weather = null;
    if (farm?.latitude && farm?.longitude) {
      weather = await fetchWeather(farm.latitude, farm.longitude, 3).catch(() => null);
    }

    // Get additional metrics for comprehensive dashboard
    const cropAnalyses = farm ? await CropAnalysis.find({ farmId: farm._id }).sort({ createdAt: -1 }).limit(3) : [];
    const marketAdvisory = await getMarketAdvisory(farm?.currentCrop || 'wheat').catch(() => null);
    
    // Calculate comprehensive farm metrics
    const farmMetrics = calculateFarmMetrics(farm, soilReading, weather);
    
    // Format alerts with proper structure for frontend
    const formattedRecentAlerts = recentAlerts.map(alert => ({
      id: alert._id,
      type: alert.severity || 'info', 
      icon: getAlertIcon(alert.type),
      text: alert.message,
      time: formatTimeAgo(alert.createdAt),
      color: getAlertColor(alert.severity),
      action: alert.action,
      source: alert.source
    }));

    const dashboard = {
      user: { id: req.userId },
      farm: farm ? {
        _id:             farm._id,
        name:            farm.name || 'My Farm',
        landSize:        farm.landSize,
        irrigationType:  farm.irrigationType,
        currentCrop:     farm.croppingHistory?.slice(-1)[0]?.crop || null,
        croppingHistory: farm.croppingHistory?.slice(-3) || [],
        location: {
          lat: farm.latitude,
          lng: farm.longitude,
        },
      } : null,
      soil: soilReading ? {
        N:             soilReading.N,
        P:             soilReading.P,
        K:             soilReading.K,
        pH:            soilReading.pH,
        moisture:      soilReading.moisture,
        organicCarbon: soilReading.organicCarbon,
        sulfur:        soilReading.S || 0,
        zinc:          soilReading.Zn || 0,
        healthScore:   soilReading.healthScore || healthScore,
        lastTested:    soilReading.readingDate,
      } : (farm?.currentSoilHealth || null),
      healthScore,
      alerts: {
        unreadCount: unreadAlerts,
        recent:      formattedRecentAlerts,
        total:       formattedRecentAlerts.length,
      },
      weather: weather ? {
        current:    weather.current,
        daily:      weather.daily?.slice(0, 7), // Full week forecast
        hourly:     weather.hourly?.slice(0, 24), // 24-hour forecast
        farmAlerts: weather.farmAlerts,
      } : null,
      metrics: farmMetrics,
      cropAnalyses: cropAnalyses.slice(0, 3),
      marketAdvisory,
      realTimeData: {
        timestamp: new Date().toISOString(),
        source: 'live',
        cacheStatus: cached ? 'hit' : 'miss'
      },
      generatedAt: new Date().toISOString(),
    };

    await cacheSet(cacheKey, dashboard, 5 * 60);   // 5-minute cache
    res.json(dashboard);

  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
};

/**
 * Calculate comprehensive farm metrics
 */
function calculateFarmMetrics(farm, soilReading, weather) {
  if (!farm) return null;
  
  const metrics = {
    yield: {
      current: farm.croppingHistory?.slice(-1)[0]?.yield || '0 t/ha',
      trend: 'stable',
      change: 0
    },
    efficiency: {
      water: calculateWaterEfficiency(farm),
      nutrient: calculateNutrientEfficiency(soilReading),
      energy: 85 // placeholder
    },
    sustainability: {
      carbonFootprint: calculateCarbonFootprint(farm),
      biodiversity: 78, // placeholder  
      soilHealth: soilReading?.healthScore || 70
    }
  };
  
  return metrics;
}

/**
 * Get appropriate icon for alert type
 */
function getAlertIcon(alertType) {
  const iconMap = {
    weather_warning: 'CloudRain',
    pest_risk: 'AlertTriangle', 
    soil_deficiency: 'Droplets',
    irrigation_needed: 'Droplets',
    crop_stage: 'CheckCircle2',
    market_price: 'TrendingUp',
    ai_recommendation: 'Zap',
    system: 'CheckCircle2'
  };
  return iconMap[alertType] || 'AlertTriangle';
}

/**
 * Get appropriate color for alert severity
 */
function getAlertColor(severity) {
  const colorMap = {
    info: 'brand',
    warning: 'harvest', 
    critical: 'alert'
  };
  return colorMap[severity] || 'brand';
}

/**
 * Format timestamp to relative time
 */
function formatTimeAgo(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

/**
 * Calculate water efficiency score
 */
function calculateWaterEfficiency(farm) {
  // Simplified calculation based on irrigation type
  const efficiency = {
    'drip': 90,
    'sprinkler': 75,
    'flood': 60,
    'rainfed': 85
  };
  return efficiency[farm.irrigationType] || 70;
}

/**
 * Calculate nutrient efficiency score 
 */
function calculateNutrientEfficiency(soilReading) {
  if (!soilReading) return 70;
  
  const optimalRanges = {
    N: [150, 300],
    P: [25, 50], 
    K: [150, 300],
    pH: [6.0, 7.5]
  };
  
  let efficiency = 100;
  Object.entries(optimalRanges).forEach(([nutrient, [min, max]]) => {
    const value = soilReading[nutrient];
    if (value && (value < min || value > max)) {
      efficiency -= 10;
    }
  });
  
  return Math.max(50, efficiency);
}

/**
 * Calculate carbon footprint score
 */
function calculateCarbonFootprint(farm) {
  // Simplified calculation 
  let score = 70;
  if (farm.irrigationType === 'drip') score += 10;
  if (farm.croppingHistory?.some(crop => crop.crop === 'legume')) score += 5;
  return Math.min(100, score);
}

/**
 * Get market advisory data
 */
async function getMarketAdvisory(cropName) {
  // This would integrate with actual market data API
  return {
    crop: cropName,
    price: '₹2,450/quintal',
    trend: 'up',
    change: '+5.2%',
    forecast: 'Prices expected to rise due to reduced supply',
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Compute a 0-100 farm health score from soil readings.
 * Penalties for out-of-range values, bonuses for optimal.
 */
function computeHealthScore(soilReading, farm) {
  if (!soilReading && !farm?.currentSoilHealth) return null;

  const s = soilReading || farm.currentSoilHealth;
  let score = 100;

  // pH penalty
  const pH = s.pH || s.ph;
  if (pH) {
    if (pH < 5.5 || pH > 8.0)  score -= 20;
    else if (pH < 6.0 || pH > 7.5) score -= 10;
  }

  // Nitrogen penalty
  const N = s.N;
  if (N != null) {
    if (N < 100)       score -= 15;
    else if (N < 150)  score -= 7;
  }

  // Phosphorus penalty
  const P = s.P;
  if (P != null) {
    if (P < 10)        score -= 10;
    else if (P < 20)   score -= 5;
  }

  // Potassium penalty
  const K = s.K;
  if (K != null) {
    if (K < 80)        score -= 10;
    else if (K < 100)  score -= 5;
  }

  // Organic carbon penalty
  const oc = s.organicCarbon;
  if (oc != null) {
    if (oc < 0.5)      score -= 10;
    else if (oc < 0.75) score -= 5;
  }

  return Math.max(0, Math.min(100, score));
}
