/**
 * Market Intelligence Service
 * 
 * Integrates:
 * - News API for agricultural market news
 * - SERPER API for web search on crop prices & trends
 * - Real-time market data aggregation
 * - Profit analysis and investment recommendations
 */

const axios = require('axios');
const NodeCache = require('node-cache');

// Initialize cache (10 minute TTL for market data)
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

const CROPS = {
  rice: { name: 'Rice', hindi: 'चावल', category: 'Cereals' },
  wheat: { name: 'Wheat', hindi: 'गेहूं', category: 'Cereals' },
  cotton: { name: 'Cotton', hindi: 'कपास', category: 'Cash Crop' },
  sugarcane: { name: 'Sugarcane', hindi: 'गन्ना', category: 'Cash Crop' },
  corn: { name: 'Corn', hindi: 'मकई', category: 'Cereals' },
  soybean: { name: 'Soybean', hindi: 'सोयाबीन', category: 'Pulses' },
  tomato: { name: 'Tomato', hindi: 'टमाटर', category: 'Vegetables' },
  onion: { name: 'Onion', hindi: 'प्याज', category: 'Vegetables' },
  potato: { name: 'Potato', hindi: 'आलू', category: 'Vegetables' },
  groundnut: { name: 'Groundnut', hindi: 'मूंगफली', category: 'Oilseeds' }
};

const CROP_SEASONS = {
  rice: { season: 'Monsoon/Kharif', months: 'June-October', plantingMonth: 'June' },
  wheat: { season: 'Winter/Rabi', months: 'October-March', plantingMonth: 'October' },
  cotton: { season: 'Monsoon/Kharif', months: 'June-October', plantingMonth: 'June' },
  sugarcane: { season: 'All-year (mainly Kharif)', months: 'June-October', plantingMonth: 'June' },
  corn: { season: 'Monsoon/Kharif', months: 'June-October', plantingMonth: 'June' },
  soybean: { season: 'Monsoon/Kharif', months: 'June-October', plantingMonth: 'June' },
  tomato: { season: 'Winter', months: 'October-February', plantingMonth: 'August' },
  onion: { season: 'Winter', months: 'October-March', plantingMonth: 'June' },
  potato: { season: 'Winter', months: 'October-March', plantingMonth: 'August' },
  groundnut: { season: 'Monsoon/Kharif', months: 'June-October', plantingMonth: 'June' }
};

/**
 * Fetch weather data for agricultural planning
 * @param {string} location - Location/city name or latitude,longitude
 * @returns {Promise} Weather data including rainfall, temperature, humidity
 */
async function getWeatherData(location = 'India') {
  try {
    const cacheKey = `weather_${location}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    if (!process.env.WEATHER_API_KEY) {
      console.warn('Weather API key not configured');
      return null;
    }

    const response = await axios.get('https://api.weatherapi.com/v1/current.json', {
      params: {
        key: process.env.WEATHER_API_KEY,
        q: location,
        aqi: 'yes'
      },
      timeout: 5000
    });

    const weatherData = {
      location: `${response.data.location.name}, ${response.data.location.region}`,
      temperature: response.data.current.temp_c,
      feelsLike: response.data.current.feelslike_c,
      humidity: response.data.current.humidity,
      rainfall: response.data.current.precip_mm,
      windSpeed: response.data.current.wind_kph,
      condition: response.data.current.condition.text,
      icon: response.data.current.condition.icon,
      uvIndex: response.data.current.uv,
      lastUpdated: new Date(response.data.current.last_updated)
    };

    cache.set(cacheKey, weatherData);
    return weatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    return null;
  }
}

/**
 * Get weather forecast for crop planning
 * @param {string} location - Location/city name
 * @returns {Promise} 7-day forecast
 */
async function getWeatherForecast(location = 'India') {
  try {
    const cacheKey = `forecast_${location}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    if (!process.env.WEATHER_API_KEY) {
      return null;
    }

    const response = await axios.get('https://api.weatherapi.com/v1/forecast.json', {
      params: {
        key: process.env.WEATHER_API_KEY,
        q: location,
        days: 7,
        aqi: 'yes'
      },
      timeout: 5000
    });

    const forecast = response.data.forecast.forecastday.map(day => ({
      date: day.date,
      maxTempC: day.day.maxtemp_c,
      minTempC: day.day.mintemp_c,
      avgTempC: day.day.avgtemp_c,
      totalRainfallMm: day.day.totalprecip_mm,
      chanceOfRain: day.day.daily_chance_of_rain,
      condition: day.day.condition.text,
      humidity: day.day.avghumidity,
      uvIndex: day.day.uv
    }));

    cache.set(cacheKey, forecast);
    return forecast;
  } catch (error) {
    console.error('Error fetching weather forecast:', error.message);
    return null;
  }
}

/**
 * Analyze weather impact on crop recommendations
 * @param {string} cropName - Crop to analyze
 * @param {string} location - Location for weather data
 * @returns {Promise} Weather suitability for crop
 */
async function analyzeWeatherSuitability(cropName, location = 'India') {
  try {
    const weather = await getWeatherData(location);
    if (!weather) return null;

    const cropRequirements = {
      rice: { tempMin: 20, tempMax: 35, rainfallMin: 100, rainfallMax: 300, idealHumidity: 75 },
      wheat: { tempMin: 15, tempMax: 25, rainfallMin: 40, rainfallMax: 100, idealHumidity: 65 },
      cotton: { tempMin: 20, tempMax: 35, rainfallMin: 60, rainfallMax: 200, idealHumidity: 70 },
      corn: { tempMin: 18, tempMax: 32, rainfallMin: 80, rainfallMax: 200, idealHumidity: 70 },
      tomato: { tempMin: 15, tempMax: 30, rainfallMin: 50, rainfallMax: 150, idealHumidity: 75 },
      onion: { tempMin: 12, tempMax: 25, rainfallMin: 30, rainfallMax: 100, idealHumidity: 60 },
      potato: { tempMin: 10, tempMax: 25, rainfallMin: 40, rainfallMax: 120, idealHumidity: 70 }
    };

    const requirements = cropRequirements[cropName.toLowerCase()] || cropRequirements.rice;
    
    let suitability = 100;
    let issues = [];

    // Temperature check
    if (weather.temperature < requirements.tempMin || weather.temperature > requirements.tempMax) {
      suitability -= 20;
      issues.push(`Temperature ${weather.temperature}°C is outside ideal range (${requirements.tempMin}-${requirements.tempMax}°C)`);
    }

    // Humidity check
    if (Math.abs(weather.humidity - requirements.idealHumidity) > 15) {
      suitability -= 15;
      issues.push(`Humidity ${weather.humidity}% is not ideal (target: ${requirements.idealHumidity}%)`);
    }

    // UV index check
    if (weather.uvIndex > 8) {
      suitability -= 10;
      issues.push(`High UV index (${weather.uvIndex}) may stress the crop`);
    }

    return {
      suitability: Math.max(0, suitability),
      issues,
      weather,
      requirements
    };
  } catch (error) {
    console.error('Error analyzing weather suitability:', error.message);
    return null;
  }
}

/**
 * Fetch agricultural news from News API
 */
async function fetchAgriculturalNews(cropName = null, limit = 10) {
  try {
    const cacheKey = `news_${cropName || 'general'}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const query = cropName 
      ? `${cropName} crop farming india prices`
      : 'agriculture farming crops india prices news';

    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: query,
        country: 'in',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: limit,
        apiKey: process.env.NEWS_API_KEY
      },
      timeout: 5000
    });

    const articles = response.data.articles.map(article => ({
      title: article.title,
      description: article.description,
      source: article.source.name,
      url: article.url,
      publishedAt: new Date(article.publishedAt),
      image: article.urlToImage,
      content: article.content
    }));

    cache.set(cacheKey, articles);
    return articles;
  } catch (error) {
    console.error('Error fetching agricultural news:', error.message);
    return [];
  }
}

/**
 * Search for current crop prices using SERPER API
 */
async function searchCropPrices(cropName) {
  try {
    const cacheKey = `price_${cropName}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const response = await axios.post(
      'https://google.serper.dev/search',
      {
        q: `${cropName} price today india rupees mandi`,
        gl: 'in',
        num: 10
      },
      {
        headers: {
          'X-API-KEY': process.env.SERPER_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      }
    );

    const results = response.data.organic?.slice(0, 5).map(result => ({
      title: result.title,
      snippet: result.snippet,
      link: result.link
    })) || [];

    cache.set(cacheKey, results);
    return results;
  } catch (error) {
    console.error('Error searching crop prices:', error.message);
    return [];
  }
}

/**
 * Get market data with sentiment analysis
 */
async function getMarketTrends(crops = []) {
  try {
    const trends = {};

    for (const crop of crops) {
      const news = await fetchAgriculturalNews(crop, 5);
      const priceSearch = await searchCropPrices(crop);

      // Sentiment analysis based on news keywords
      let sentiment = 'neutral';
      let confidence = 0.5;

      const newsText = news.map(n => `${n.title} ${n.description}`).join(' ').toLowerCase();
      
      if (newsText.includes('price increase') || newsText.includes('high demand') || newsText.includes('shortage')) {
        sentiment = 'bullish';
        confidence = 0.8;
      } else if (newsText.includes('price decrease') || newsText.includes('oversupply') || newsText.includes('low demand')) {
        sentiment = 'bearish';
        confidence = 0.8;
      }

      trends[crop] = {
        sentiment,
        confidence,
        newsCount: news.length,
        recentNews: news.slice(0, 3),
        priceSearchResults: priceSearch,
        lastUpdated: new Date()
      };
    }

    return trends;
  } catch (error) {
    console.error('Error getting market trends:', error.message);
    return {};
  }
}

/**
 * Estimate profit for a crop based on market conditions
 */
function estimateProfit(cropName, area = 1) {
  // Data sourced from typical Indian market conditions
  const profitData = {
    rice: {
      avgPrice: 2500,        // ₹/quintal
      avgYield: 50,          // quintals/hectare
      costPerHectare: 50000, // ₹/hectare
      marketTrend: 'stable'
    },
    wheat: {
      avgPrice: 2300,
      avgYield: 45,
      costPerHectare: 45000,
      marketTrend: 'stable'
    },
    cotton: {
      avgPrice: 6500,        // ₹/quintal
      avgYield: 18,          // quintals/hectare
      costPerHectare: 80000,
      marketTrend: 'volatile'
    },
    sugarcane: {
      avgPrice: 295,         // ₹/quintal
      avgYield: 800,         // quintals/hectare
      costPerHectare: 120000,
      marketTrend: 'volatile'
    },
    corn: {
      avgPrice: 2000,
      avgYield: 55,
      costPerHectare: 40000,
      marketTrend: 'stable'
    },
    soybean: {
      avgPrice: 4800,
      avgYield: 20,
      costPerHectare: 35000,
      marketTrend: 'bullish'
    },
    tomato: {
      avgPrice: 2000,        // ₹/quintal
      avgYield: 400,         // quintals/hectare
      costPerHectare: 100000,
      marketTrend: 'volatile'
    },
    onion: {
      avgPrice: 1800,
      avgYield: 350,
      costPerHectare: 90000,
      marketTrend: 'volatile'
    },
    potato: {
      avgPrice: 1200,
      avgYield: 300,
      costPerHectare: 80000,
      marketTrend: 'stable'
    },
    groundnut: {
      avgPrice: 5500,
      avgYield: 15,
      costPerHectare: 60000,
      marketTrend: 'stable'
    }
  };

  if (!profitData[cropName.toLowerCase()]) {
    return null;
  }

  const data = profitData[cropName.toLowerCase()];
  const revenue = data.avgPrice * data.avgYield * area;
  const cost = data.costPerHectare * area;
  const profit = revenue - cost;
  const roi = ((profit / cost) * 100).toFixed(2);

  return {
    cropName,
    area,
    revenue: Math.round(revenue),
    cost: Math.round(cost),
    profit: Math.round(profit),
    roi: `${roi}%`,
    avgYield: data.avgYield,
    marketTrend: data.marketTrend,
    recommendation: profit > 0 ? 'RECOMMENDED' : 'NOT RECOMMENDED'
  };
}

/**
 * Get current month and season
 */
function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  let season = 'Rabi';
  if (month >= 6 && month <= 10) season = 'Kharif';
  if (month >= 11 || month <= 2) season = 'Rabi';
  if ((month >= 3 && month <= 5)) season = 'Summer';

  return { month: months[month - 1], season, monthNumber: month };
}

/**
 * Recommend best crops to plant now based on season
 */
function getSeasonalRecommendations() {
  const { season } = getCurrentSeason();
  const recommendations = [];

  for (const [cropId, crop] of Object.entries(CROPS)) {
    const cropSeason = CROP_SEASONS[cropId];
    if (cropSeason.season.includes(season) || cropSeason.season.includes(getCurrentSeason().month)) {
      recommendations.push({
        crop: crop.name,
        cropId,
        season: cropSeason.season,
        months: cropSeason.months,
        plantingMonth: cropSeason.plantingMonth,
        timing: 'OPTIMAL'
      });
    }
  }

  return recommendations;
}

/**
 * Analyze image and recommend best crops with profit analysis
 */
async function analyzeImageAndRecommend(imageAnalysisResult, area = 1) {
  try {
    const recommendedCrops = imageAnalysisResult.suggestedCrops || [];
    const trends = await getMarketTrends(recommendedCrops);
    const seasonalRecs = getSeasonalRecommendations();

    const detailedRecommendations = recommendedCrops.map(cropName => {
      const profit = estimateProfit(cropName, area);
      const marketData = trends[cropName] || {};
      const seasonalMatch = seasonalRecs.find(r => r.crop.toLowerCase() === cropName.toLowerCase());

      return {
        crop: cropName,
        profitAnalysis: profit,
        marketIntelligence: {
          sentiment: marketData.sentiment || 'neutral',
          confidence: (marketData.confidence * 100).toFixed(1) + '%',
          recentTrends: marketData.recentNews?.slice(0, 2) || []
        },
        seasonalSuitability: seasonalMatch || { timing: 'OFF-SEASON - Not recommended' },
        investmentScore: calculateInvestmentScore(profit, marketData, seasonalMatch),
        recommendation: generateRecommendation(profit, marketData, seasonalMatch)
      };
    });

    // Sort by investment score
    detailedRecommendations.sort((a, b) => b.investmentScore - a.investmentScore);

    return {
      recommendations: detailedRecommendations,
      topChoice: detailedRecommendations[0],
      marketUpdatedAt: new Date(),
      area
    };
  } catch (error) {
    console.error('Error analyzing image and recommending:', error.message);
    throw error;
  }
}

/**
 * Calculate investment score (0-100)
 */
function calculateInvestmentScore(profit, marketData, seasonalMatch) {
  let score = 50; // Base score

  // Profit component
  if (profit) {
    if (profit.roi > 50) score += 25;
    else if (profit.roi > 30) score += 15;
    else if (profit.roi > 10) score += 5;
  }

  // Market sentiment component
  if (marketData.sentiment === 'bullish') score += 15;
  else if (marketData.sentiment === 'bearish') score -= 15;

  // Seasonal component
  if (seasonalMatch?.timing === 'OPTIMAL') score += 10;
  else if (!seasonalMatch) score -= 15;

  return Math.min(100, Math.max(0, score));
}

/**
 * Generate human-readable recommendation
 */
function generateRecommendation(profit, marketData, seasonalMatch) {
  const reasons = [];

  if (seasonalMatch?.timing === 'OPTIMAL') {
    reasons.push('✅ Optimal season for planting');
  } else {
    reasons.push('⚠️ Off-season - reduced yield expected');
  }

  if (profit && profit.roi > 30) {
    reasons.push(`💰 Strong profit potential (${profit.roi} ROI)`);
  } else if (profit) {
    reasons.push(`📊 Moderate profit (${profit.roi} ROI)`);
  }

  if (marketData.sentiment === 'bullish') {
    reasons.push('📈 Positive market sentiment');
  } else if (marketData.sentiment === 'bearish') {
    reasons.push('📉 Caution: Market showing weakness');
  }

  return {
    overall: calculateInvestmentScore(profit, marketData, seasonalMatch) > 60 ? 'RECOMMENDED' : 'CONSIDER WITH CAUTION',
    reasons,
    riskLevel: marketData.sentiment === 'bullish' ? 'LOW' : 'MODERATE'
  };
}

/**
 * Format profit analysis for display
 */
function formatProfitAnalysis(profitData) {
  if (!profitData) return null;

  return {
    crop: profitData.cropName,
    expectedRevenue: `₹${profitData.revenue.toLocaleString('en-IN')} for ${profitData.area} hectare(s)`,
    totalCost: `₹${profitData.cost.toLocaleString('en-IN')}`,
    netProfit: `₹${profitData.profit.toLocaleString('en-IN')}`,
    roi: profitData.roi,
    avgYield: `${profitData.avgYield} quintals/hectare`,
    marketTrend: profitData.marketTrend,
    recommendation: profitData.recommendation
  };
}

module.exports = {
  fetchAgriculturalNews,
  searchCropPrices,
  getMarketTrends,
  estimateProfit,
  getSeasonalRecommendations,
  getCurrentSeason,
  analyzeImageAndRecommend,
  calculateInvestmentScore,
  generateRecommendation,
  formatProfitAnalysis,
  getWeatherData,
  getWeatherForecast,
  analyzeWeatherSuitability,
  CROPS,
  CROP_SEASONS
};
