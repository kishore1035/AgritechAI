/**
 * AgriTech Example Commands
 * Demonstrates how to register and use commands in the CommandRegistry
 */

const CommandRegistry = require('./CommandRegistry');

/**
 * Create and initialize example commands
 */
async function initializeExampleCommands(registry) {
  // ────────────────────────────────────────────────────────────
  // Farm Management Commands
  // ────────────────────────────────────────────────────────────

  registry.register(
    'farm-status',
    async (context, params) => {
      // TODO: Fetch farm status from database
      return {
        farmId: context.farmId,
        status: 'healthy',
        lastUpdate: new Date(),
        crops: ['rice', 'wheat'],
        soilHealth: 75,
        waterStatus: 'adequate'
      };
    },
    'Get current status of the farm',
    'farm',
    ['read:farm']
  );

  registry.register(
    'farm-info',
    async (context, params) => {
      // TODO: Get detailed farm information
      return {
        farmId: context.farmId,
        name: 'Sample Farm',
        area: 5, // hectares
        location: 'Punjab',
        soilType: 'loamy',
        irrigationType: 'drip',
        crops: ['rice', 'wheat'],
        owner: context.userId
      };
    },
    'Get detailed information about the farm',
    'farm',
    ['read:farm']
  );

  // ────────────────────────────────────────────────────────────
  // Soil Commands
  // ────────────────────────────────────────────────────────────

  registry.register(
    'soil-analysis',
    async (context, params) => {
      // TODO: Call ML service for soil analysis
      return {
        ph: 6.8,
        nitrogen: 45,
        phosphorus: 20,
        potassium: 180,
        organicMatter: 2.5,
        recommendation: 'Add nitrogen fertilizer'
      };
    },
    'Analyze soil properties and get recommendations',
    'soil',
    ['read:soil']
  );

  registry.register(
    'soil-history',
    async (context, params) => {
      // TODO: Get historical soil data
      return {
        records: [
          { date: '2024-01-15', ph: 6.9, nitrogen: 42 },
          { date: '2024-02-15', ph: 6.8, nitrogen: 45 },
          { date: '2024-03-15', ph: 6.7, nitrogen: 48 }
        ]
      };
    },
    'Get historical soil analysis records',
    'soil',
    ['read:soil']
  );

  // ────────────────────────────────────────────────────────────
  // Crop Commands
  // ────────────────────────────────────────────────────────────

  registry.register(
    'crop-health',
    async (context, params) => {
      const cropId = params.cropId || 'default';
      // TODO: Analyze crop health from images or data
      return {
        cropId,
        healthScore: 82,
        issues: ['slight leaf spotting'],
        recommendations: ['Apply fungicide', 'Improve irrigation']
      };
    },
    'Check health status of a crop',
    'farm',
    ['read:crop']
  );

  registry.register(
    'crop-schedule',
    async (context, params) => {
      // TODO: Get farming schedule
      return {
        currentStage: 'vegetative',
        nextAction: 'Fertilizer application in 5 days',
        harvestDate: '2024-06-15',
        daysToMaturity: 45
      };
    },
    'Get crop schedule and upcoming tasks',
    'farm',
    ['read:crop']
  );

  // ────────────────────────────────────────────────────────────
  // Weather Commands
  // ────────────────────────────────────────────────────────────

  registry.register(
    'weather-forecast',
    async (context, params) => {
      // TODO: Call weather API
      return {
        location: params.location || 'Farm location',
        forecast: [
          { date: '2024-03-20', temp: 28, humidity: 65, rain: 0 },
          { date: '2024-03-21', temp: 27, humidity: 70, rain: 5 },
          { date: '2024-03-22', temp: 29, humidity: 60, rain: 0 }
        ]
      };
    },
    'Get weather forecast for the farm area',
    'weather',
    ['read:weather']
  );

  registry.register(
    'weather-alerts',
    async (context, params) => {
      // TODO: Get active weather alerts
      return {
        alerts: [
          {
            type: 'rain',
            severity: 'medium',
            message: 'Heavy rain expected tomorrow',
            actionRequired: 'Cover crops or delay harvesting'
          }
        ]
      };
    },
    'Get active weather alerts for the farm',
    'weather',
    ['read:alerts']
  );

  // ────────────────────────────────────────────────────────────
  // Market Commands
  // ────────────────────────────────────────────────────────────

  registry.register(
    'market-prices',
    async (context, params) => {
      const crop = params.crop || 'rice';
      // TODO: Fetch market prices from API
      return {
        crop,
        currentPrice: 2500,
        trend: 'up',
        priceRange: { min: 2400, max: 2600 },
        lastUpdate: new Date()
      };
    },
    'Get current market prices for crops',
    'market',
    ['read:market']
  );

  registry.register(
    'market-advice',
    async (context, params) => {
      // TODO: Generate market advice based on prices and farm data
      return {
        advice: 'Good time to sell - prices are trending up',
        confidence: 0.85,
        reasoning: 'Market demand is high, supply is moderate'
      };
    },
    'Get market advice for selling crops',
    'market',
    ['read:market']
  );

  console.log('✓ Example commands registered');
}

/**
 * Example: How to execute commands
 */
async function exampleCommandExecution(registry, context) {
  try {
    // Get farm status
    const status = await registry.execute('farm-status', context);
    console.log('Farm Status:', status);

    // Get soil analysis
    const soil = await registry.execute('soil-analysis', context);
    console.log('Soil Analysis:', soil);

    // Get weather forecast
    const weather = await registry.execute('weather-forecast', context, {
      location: 'Punjab'
    });
    console.log('Weather Forecast:', weather);

    // Get market prices
    const prices = await registry.execute('market-prices', context, {
      crop: 'rice'
    });
    console.log('Market Prices:', prices);
  } catch (error) {
    console.error('Command execution error:', error);
  }
}

/**
 * Example: Get command registry statistics
 */
function exampleRegistryStats(registry) {
  const stats = registry.getStats();
  console.log('Registry Statistics:', stats);

  const markdown = registry.renderMarkdown();
  console.log('\nRegistry Markdown:\n', markdown);
}

module.exports = {
  initializeExampleCommands,
  exampleCommandExecution,
  exampleRegistryStats
};
