const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const {
  getWeather, getFarmWeather, getDashboardWeather,
  getCurrentWeatherData, getWeatherForecastData, getCropSuitability, 
  getHourlyWeather, getComprehensiveWeather
} = require('../controllers/weatherController');

router.use(authMiddleware);

/**
 * GET /api/weather?lat=18.52&lng=73.85&days=7
 *   Full 7-day forecast for given coordinates.
 *   Response: { current, hourly, daily, farmAlerts, cacheSource }
 *
 * GET /api/weather/current
 *   Compact weather for the Dashboard header widget.
 *   Uses user's primary farm location.
 *
 * GET /api/weather/farm/:farmId
 *   Full forecast for a specific registered farm.
 *   Also triggers weather-alert processing for that farm.
 */
router.get('/',            getWeather);
router.get('/current',     getDashboardWeather);
router.get('/farm/:farmId', getFarmWeather);
router.get('/hourly',      getHourlyWeather);         // New: GET /api/weather/hourly?lat=&lng=&hours=
router.get('/comprehensive', getComprehensiveWeather); // New: GET /api/weather/comprehensive?lat=&lng=&days=

// New Market Intelligence Weather Endpoints
/**
 * GET /api/weather/data/current?location=Delhi
 *   Get current weather from Market Intelligence Service
 *
 * GET /api/weather/data/forecast?location=Punjab
 *   Get 7-day forecast for agricultural planning
 *
 * GET /api/weather/data/crop-suitability?crop=wheat&location=Haryana
 *   Analyze weather suitability for a crop
 *
 * GET /api/weather/data/recommendations?crop=rice&location=Tamil%20Nadu
 *   Get comprehensive weather recommendations for planting
 */
router.get('/data/current-weather', getCurrentWeatherData);
router.get('/data/forecast', getWeatherForecastData);
router.get('/data/crop-suitability', getCropSuitability);
// router.get('/data/recommendations', getWeatherRecommendations); // TODO: Implement in controller

module.exports = router;
