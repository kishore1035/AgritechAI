/**
 * Helper utilities for crop analysis and market intelligence
 */

/**
 * Format currency values
 */
exports.formatCurrency = (amount, currency = 'INR') => {
  if (!amount) return `₹0`;
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return formatter.format(amount);
};

/**
 * Extract crop name from image filename
 */
exports.extractCropFromImage = (filename) => {
  if (!filename) return null;
  
  // Remove extension
  const nameWithoutExt = filename.split('.')[0];
  
  // Split by underscore or hyphen
  const parts = nameWithoutExt.split(/[_-]/);
  
  // Return first part (likely crop name)
  return parts[0]?.toLowerCase() || null;
};

/**
 * Validate crop name
 */
exports.isValidCrop = (cropName) => {
  const validCrops = [
    'rice', 'wheat', 'corn', 'cotton', 'tomato',
    'onion', 'potato', 'sugarcane', 'tea', 'coffee',
    'mango', 'apple', 'banana', 'grape', 'coconut',
    'chilli', 'cumin', 'turmeric', 'mustard', 'soybean'
  ];

  return validCrops.includes(cropName?.toLowerCase());
};

/**
 * Calculate suitability percentage
 */
exports.calculateSuitability = (score, maxScore = 100) => {
  if (!score || maxScore === 0) return 0;
  return Math.min(100, Math.round((score / maxScore) * 100));
};

/**
 * Generate investment recommendation
 */
exports.getInvestmentRecommendation = (investmentScore) => {
  if (investmentScore >= 80) return 'Highly Recommended';
  if (investmentScore >= 60) return 'Recommended';
  if (investmentScore >= 40) return 'Neutral';
  if (investmentScore >= 20) return 'Not Recommended';
  return 'Strongly Not Recommended';
};

/**
 * Get season for a month
 */
exports.getSeason = (month = new Date().getMonth() + 1) => {
  if (month >= 3 && month <= 5) return 'Summer';
  if (month >= 6 && month <= 9) return 'Monsoon';
  if (month >= 10 && month <= 11) return 'Winter';
  return 'Pre-Monsoon';
};

/**
 * Parse location string into components
 */
exports.parseLocation = (location) => {
  if (!location) return { state: null, district: null };

  const parts = location.split(',').map(p => p.trim());
  
  return {
    district: parts[0],
    state: parts[1] || null,
  };
};

/**
 * Calculate profit margin percentage
 */
exports.calculateProfitMargin = (profit, revenue) => {
  if (!revenue || revenue === 0) return 0;
  return Math.round((profit / revenue) * 100);
};

/**
 * Format percentage
 */
exports.formatPercentage = (value, decimals = 1) => {
  if (typeof value !== 'number') return '0%';
  return `${value.toFixed(decimals)}%`;
};

/**
 * Sanitize crop name for API queries
 */
exports.sanitizeCropName = (cropName) => {
  if (!cropName) return '';
  
  return cropName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9\s]/g, '');
};

/**
 * Get weather condition description
 */
exports.getWeatherCondition = (code) => {
  const conditions = {
    1000: '☀️ Sunny',
    1003: '🌤️ Partly cloudy',
    1006: '☁️ Cloudy',
    1009: '🌫️ Overcast',
    1012: '🌫️ Mist',
    1015: '🌫️ Blizzard',
    1018: '❄️ Snow',
    1021: '🌧️ Rain',
    1024: '⛈️ Thunderstorm',
    1063: '🌧️ Drizzle',
  };
  
  return conditions[code] || '❓ Unknown';
};

/**
 * Calculate days until next rain (from forecast)
 */
exports.daysUntilRain = (forecast) => {
  if (!Array.isArray(forecast)) return -1;
  
  for (let i = 0; i < forecast.length; i++) {
    if (forecast[i].chanceOfRain && forecast[i].chanceOfRain > 50) {
      return i;
    }
  }
  
  return -1; // No rain expected
};

/**
 * Validate email
 */
exports.isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validate phone number (India)
 */
exports.isValidPhone = (phone) => {
  const regex = /^[6-9]\d{9}$/;
  return regex.test(phone?.replace(/\D/g, ''));
};
