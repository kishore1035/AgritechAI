const Farm = require('../models/Farm');
const { fetchWeather } = require('../services/weatherService');
const { processWeatherAlerts } = require('../services/alertService');
const { cacheGet, cacheSet } = require('../config/redis');

/**
 * Generate hourly forecast data from current + daily data
 */
function generateHourlyForecast(current, daily, hours) {
  const hourlyData = [];
  const now = new Date();
  
  for (let i = 0; i < Math.min(hours, 24); i++) {
    const hour = new Date(now.getTime() + i * 60 * 60 * 1000);
    const dayData = daily[0] || current;
    
    // Interpolate temperature throughout the day
    const hourOfDay = hour.getHours();
    let tempFactor = 1;
    if (hourOfDay >= 6 && hourOfDay <= 14) {
      tempFactor = 0.7 + (0.3 * (hourOfDay - 6) / 8); // Morning rise
    } else if (hourOfDay > 14 && hourOfDay <= 18) {
      tempFactor = 1 - (0.2 * (hourOfDay - 14) / 4); // Afternoon drop
    } else {
      tempFactor = 0.6; // Night
    }
    
    hourlyData.push({
      time: hour.getHours() === 0 ? '12am' : 
            hour.getHours() === 12 ? '12pm' : 
            hour.getHours() > 12 ? `${hour.getHours() - 12}pm` : `${hour.getHours()}am`,
      temp: Math.round((dayData.tempHigh * tempFactor + dayData.tempLow * (1 - tempFactor))),
      humidity: current.humidity + (Math.random() - 0.5) * 10,
      rain: dayData.rainChance > 50 && hourOfDay >= 12 && hourOfDay <= 18 ? 
            Math.round(Math.random() * 25) : 0,
      windSpeed: current.windSpeed + (Math.random() - 0.5) * 5,
      windDir: current.windDir,
      pressure: current.pressure || 1013,
      uvIndex: hourOfDay >= 10 && hourOfDay <= 16 ? 
               Math.max(0, current.uvIndex - Math.abs(hourOfDay - 13)) : 0
    });
  }
  
  return hourlyData;
}

/**
 * Generate farming-specific alerts from weather data
 */
function generateFarmingAlerts(current, daily) {
  const alerts = [];
  
  // Temperature alerts
  if (current.temp > 35) {
    alerts.push({
      level: 'warning',
      type: 'temperature',
      title: 'High Temperature Alert',
      message: `Temperature is ${current.temp}°C. Consider adjusting irrigation schedules.`,
      icon: 'Thermometer',
      color: 'alert',
      action: 'Increase irrigation frequency'
    });
  }
  
  // Rain alerts
  const nextRainyDay = daily.find(day => day.rainChance > 70);
  if (nextRainyDay) {
    alerts.push({
      level: 'info',
      type: 'precipitation',
      title: 'Rain Expected',
      message: `${nextRainyDay.rainChance}% chance of rain on ${nextRainyDay.dayLabel}`,
      icon: 'CloudRain',
      color: 'sky',
      action: 'Plan field activities accordingly'
    });
  }
  
  // Wind alerts
  if (current.windSpeed > 25) {
    alerts.push({
      level: 'warning',
      type: 'wind',
      title: 'High Wind Speed',
      message: `Wind speed is ${current.windSpeed} km/h. Avoid spraying operations.`,
      icon: 'Wind',
      color: 'harvest',
      action: 'Postpone chemical applications'
    });
  }
  
  // UV alerts
  if (current.uvIndex >= 8) {
    alerts.push({
      level: 'info',
      type: 'uv',
      title: 'High UV Index',
      message: 'UV index is very high. Limit field work during peak hours.',
      icon: 'Sun',
      color: 'harvest',
      action: 'Schedule work for early morning or evening'
    });
  }
  
  return alerts;
}

/**
 * Generate weather-based farming recommendations
 */
function generateWeatherRecommendations(current, daily) {
  const recommendations = [];
  
  // Irrigation recommendations
  if (current.humidity < 40 && current.temp > 30) {
    recommendations.push({
      type: 'irrigation',
      priority: 'high',
      title: 'Increase Irrigation',
      description: 'Low humidity and high temperature detected. Increase irrigation frequency.'
    });
  }
  
  // Planting recommendations  
  const goodWeatherDays = daily.filter(day => 
    day.rainChance < 30 && day.tempHigh < 35 && day.tempLow > 10
  );
  
  if (goodWeatherDays.length >= 3) {
    recommendations.push({
      type: 'planting',
      priority: 'medium',
      title: 'Good Planting Window',
      description: `${goodWeatherDays.length} days of favorable weather ahead for planting activities.`
    });
  }
  
  // Harvest recommendations
  const dryDays = daily.filter(day => day.rainChance < 10);
  if (dryDays.length >= 2) {
    recommendations.push({
      type: 'harvest',
      priority: 'medium',
      title: 'Good Harvest Conditions', 
      description: 'Dry weather expected. Good time for harvest operations.'
    });
  }
  
  return recommendations;
}

/**
 * GET /api/weather?lat=&lng=&days=7
 * Get weather for explicit coordinates (used by Weather page directly).
 */
exports.getWeather = async (req, res) => {
  try {
    const { lat, lng, days = 7 } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat and lng are required' });

    const data = await fetchWeather(parseFloat(lat), parseFloat(lng), parseInt(days));
    res.json(data);
  } catch (err) {
    console.error('Weather fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
};

/**
 * GET /api/weather/farm/:farmId
 * Get weather for a specific farm's coordinates.
 * Also triggers alert processing for the farm.
 */
exports.getFarmWeather = async (req, res) => {
  try {
    const farm = await Farm.findOne({ _id: req.params.farmId, userId: req.userId });
    if (!farm) return res.status(404).json({ error: 'Farm not found' });

    const lat = farm.latitude  || 18.52;   // fallback: Pune
    const lng = farm.longitude || 73.85;

    const data = await fetchWeather(lat, lng);

    // Async: trigger weather-based alerts (non-blocking)
    if (data.cacheSource === 'api') {
      processWeatherAlerts(req.userId, farm._id, data).catch(console.error);
    }

    res.json({ ...data, farmId: farm._id, farmName: farm.farmName });
  } catch (err) {
    console.error('Farm weather error:', err.message);
    res.status(500).json({ error: 'Failed to fetch farm weather' });
  }
};

/**
 * GET /api/weather/current
 * Lightweight current-only endpoint for the Dashboard weather widget.
 * Uses the user's primary farm location.
 */
exports.getDashboardWeather = async (req, res) => {
  try {
    const cacheKey = `weather:dashboard:${req.userId}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const farm = await Farm.findOne({ userId: req.userId }).sort({ createdAt: -1 });
    const lat = farm?.latitude  || 18.52;
    const lng = farm?.longitude || 73.85;

    const data = await fetchWeather(lat, lng, 3);

    const compact = {
      current:    data.current,
      daily:      data.daily.slice(0, 3),
      farmAlerts: data.farmAlerts,
      location:   { lat, lng, district: farm ? null : 'Default' },
    };

    await cacheSet(cacheKey, compact, 15 * 60);   // 15-min cache for dashboard
    res.json(compact);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard weather' });
  }
};

/**
 * GET /api/weather/current?location=Delhi
 * Get current weather data from Market Intelligence Service
 * Enhanced endpoint for agricultural planning
 */
exports.getCurrentWeatherData = async (req, res) => {
  try {
    const { location } = req.query;

    if (!location) {
      return res.status(400).json({
        success: false,
        message: 'Location parameter is required',
      });
    }

    const { getWeatherData } = require('../services/marketIntelligenceService');
    const weather = await getWeatherData(location);

    if (!weather) {
      return res.status(404).json({
        success: false,
        message: 'Unable to fetch weather data',
      });
    }

    res.json({
      success: true,
      data: weather,
    });
  } catch (error) {
    console.error('Error fetching current weather:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching current weather',
      error: error.message,
    });
  }
};

/**
 * GET /api/weather/forecast?location=Punjab
 * Get 7-day weather forecast for a location
 */
exports.getWeatherForecastData = async (req, res) => {
  try {
    const { location } = req.query;

    if (!location) {
      return res.status(400).json({
        success: false,
        message: 'Location parameter is required',
      });
    }

    const { getWeatherForecast } = require('../services/marketIntelligenceService');
    const forecast = await getWeatherForecast(location);

    if (!forecast || forecast.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Unable to fetch weather forecast',
      });
    }

    res.json({
      success: true,
      data: forecast,
      days: forecast.length,
    });
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching weather forecast',
      error: error.message,
    });
  }
};

/**
 * GET /api/weather/crop-suitability?crop=wheat&location=Haryana
 * Analyze weather suitability for a crop at a location
 */
exports.getCropSuitability = async (req, res) => {
  try {
    const { crop, location } = req.query;

    if (!crop || !location) {
      return res.status(400).json({
        success: false,
        message: 'Both crop and location parameters are required',
      });
    }

    const { analyzeWeatherSuitability } = require('../services/marketIntelligenceService');
    const suitability = await analyzeWeatherSuitability(crop, location);

    if (!suitability) {
      return res.status(404).json({
        success: false,
        message: 'Unable to analyze weather suitability',
      });
    }

    res.json({
      success: true,
      data: suitability,
    });
  } catch (error) {
    console.error('Error analyzing crop suitability:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing crop suitability',
      error: error.message,
    });
  }
};

/**
 * GET /api/weather/hourly?lat=&lng=&hours=24
 * Get detailed hourly weather forecast
 */
exports.getHourlyWeather = async (req, res) => {
  try {
    const { lat, lng, hours = 24 } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat and lng are required' });

    const cacheKey = `weather:hourly:${lat}:${lng}:${hours}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json({ ...cached, fromCache: true });

    const weather = await fetchWeather(parseFloat(lat), parseFloat(lng), 3);
    
    // Generate hourly forecast from current + daily data
    const hourlyForecast = generateHourlyForecast(weather.current, weather.daily, parseInt(hours));
    
    const response = {
      location: { lat: parseFloat(lat), lng: parseFloat(lng) },
      hourly: hourlyForecast,
      generatedAt: new Date().toISOString()
    };

    await cacheSet(cacheKey, response, 30 * 60); // 30 min cache
    res.json(response);
  } catch (err) {
    console.error('Hourly weather error:', err);
    res.status(500).json({ error: 'Failed to fetch hourly weather' });
  }
};

/**
 * GET /api/weather/comprehensive?lat=&lng=&days=7
 * Get comprehensive weather data including hourly, daily, alerts, and farming insights
 */
exports.getComprehensiveWeather = async (req, res) => {
  try {
    const { lat, lng, days = 7 } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat and lng are required' });

    const weather = await fetchWeather(parseFloat(lat), parseFloat(lng), parseInt(days));
    
    // Generate comprehensive data
    const hourlyForecast = generateHourlyForecast(weather.current, weather.daily, 24);
    const farmingAlerts = generateFarmingAlerts(weather.current, weather.daily);
    const recommendations = generateWeatherRecommendations(weather.current, weather.daily);
    
    const response = {
      current: weather.current,
      hourly: hourlyForecast,
      daily: weather.daily,
      alerts: farmingAlerts,
      recommendations,
      farmAlerts: weather.farmAlerts,
      location: { lat: parseFloat(lat), lng: parseFloat(lng) },
      generatedAt: new Date().toISOString(),
      source: 'comprehensive-api'
    };

    res.json(response);
  } catch (err) {
    console.error('Comprehensive weather error:', err);
    res.status(500).json({ error: 'Failed to fetch comprehensive weather data' });
  }
};
