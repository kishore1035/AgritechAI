/**
 * AgriTech Example Tools
 * Demonstrates how to register tools in the ToolPool
 */

const ToolPool = require('./ToolPool');

/**
 * Initialize example tools
 */
async function initializeExampleTools(toolPool) {
  // ────────────────────────────────────────────────────────────
  // Analysis Tools
  // ────────────────────────────────────────────────────────────

  toolPool.register(
    'soil-nutrient-calculator',
    async (context, input) => {
      // Calculate nutrient requirements based on crop and soil
      const { crop, soilData, areaHectares } = input;
      
      const baseRequirements = {
        rice: { nitrogen: 120, phosphorus: 60, potassium: 60 },
        wheat: { nitrogen: 100, phosphorus: 50, potassium: 50 },
        corn: { nitrogen: 150, phosphorus: 70, potassium: 80 }
      };

      const requirements = baseRequirements[crop] || baseRequirements.rice;
      const adjusted = {
        nitrogen: requirements.nitrogen * (1 - (soilData.nitrogen || 0) / 100) * areaHectares,
        phosphorus: requirements.phosphorus * (1 - (soilData.phosphorus || 0) / 100) * areaHectares,
        potassium: requirements.potassium * (1 - (soilData.potassium || 0) / 100) * areaHectares
      };

      return {
        crop,
        requiredNutrients: adjusted,
        recommendedFertilizer: 'NPK 12-60-60',
        applicationTiming: 'Apply in 3 phases over growing season'
      };
    },
    {
      crop: { type: 'string', required: true },
      soilData: { type: 'object', required: true },
      areaHectares: { type: 'number', required: true }
    },
    'Calculate nutrient requirements for crops',
    'analysis',
    { rateLimitPerMinute: 200, experimental: false }
  );

  toolPool.register(
    'pest-identifier',
    async (context, input) => {
      // Identify pests from image or description
      const { symptomDescription, cropType } = input;

      // Simple logic - in real app would use ML model
      const pests = {
        rice: ['stem borer', 'leaf folder', 'brown planthopper'],
        wheat: ['armyworm', 'Hessian fly', 'wheat sawfly'],
        corn: ['corn borer', 'fall armyworm', 'corn earworm']
      };

      return {
        crop: cropType,
        identifiedPests: pests[cropType] || [],
        confidence: 0.85,
        managementOptions: [
          'Use recommended pesticide',
          'Biological control methods',
          'Cultural practices'
        ]
      };
    },
    {
      symptomDescription: { type: 'string', required: true },
      cropType: { type: 'string', required: true }
    },
    'Identify pests and recommend management',
    'analysis',
    { rateLimitPerMinute: 150 }
  );

  toolPool.register(
    'yield-predictor',
    async (context, input) => {
      // Predict crop yield based on conditions
      const { crop, soilHealth, weatherConditions, managementLevel } = input;

      const baseYield = {
        rice: 5,      // tons/hectare
        wheat: 4,
        corn: 8
      };

      const multipliers = {
        soilHealth: soilHealth / 100,
        weather: weatherConditions === 'optimal' ? 1.0 : weatherConditions === 'moderate' ? 0.8 : 0.5,
        management: managementLevel === 'high' ? 1.1 : managementLevel === 'medium' ? 0.9 : 0.7
      };

      const predictedYield = (baseYield[crop] || 5) * 
        multipliers.soilHealth * 
        multipliers.weather * 
        multipliers.management;

      return {
        crop,
        predictedYield: Math.round(predictedYield * 100) / 100,
        baseYield: baseYield[crop],
        factors: multipliers,
        confidence: 0.78
      };
    },
    {
      crop: { type: 'string', required: true },
      soilHealth: { type: 'number', required: true },
      weatherConditions: { type: 'string', required: true },
      managementLevel: { type: 'string', required: true }
    },
    'Predict crop yield based on conditions',
    'prediction',
    { rateLimitPerMinute: 100 }
  );

  // ────────────────────────────────────────────────────────────
  // Recommendation Tools
  // ────────────────────────────────────────────────────────────

  toolPool.register(
    'crop-rotation-recommender',
    async (context, input) => {
      // Recommend crop rotation
      const { currentCrop, soilHealth, marketPrices } = input;

      const rotationPlan = {
        rice: {
          next: 'wheat',
          reason: 'Nitrogen-fixing benefit',
          soilBenefit: 'Improved soil structure'
        },
        wheat: {
          next: 'legume',
          reason: 'Breaks disease cycle',
          soilBenefit: 'Nitrogen enrichment'
        },
        corn: {
          next: 'soybean',
          reason: 'Complementary nutrient use',
          soilBenefit: 'Nitrogen replenishment'
        }
      };

      const plan = rotationPlan[currentCrop] || { next: 'legume', reason: 'Default rotation' };

      return {
        currentCrop,
        recommendedNextCrop: plan.next,
        reason: plan.reason,
        soilBenefit: plan.soilBenefit,
        expectedProfitability: 'high',
        timeline: 'Next season'
      };
    },
    {
      currentCrop: { type: 'string', required: true },
      soilHealth: { type: 'number', required: false },
      marketPrices: { type: 'object', required: false }
    },
    'Recommend crop rotation schedule',
    'recommendation',
    { rateLimitPerMinute: 100 }
  );

  toolPool.register(
    'irrigation-scheduler',
    async (context, input) => {
      // Create irrigation schedule
      const { crop, soilType, weather, soilMoisture } = input;

      const waterNeeds = {
        rice: 1200,    // mm per season
        wheat: 450,
        corn: 600
      };

      const need = waterNeeds[crop] || 600;
      const schedule = {
        frequency: 'every 7-10 days',
        quantity: Math.round(need / 10),
        timing: 'Early morning or late evening',
        nextScheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      return {
        crop,
        recommendedSchedule: schedule,
        soilMoistureTarget: '60-80%',
        notes: 'Adjust based on rainfall'
      };
    },
    {
      crop: { type: 'string', required: true },
      soilType: { type: 'string', required: true },
      weather: { type: 'object', required: true },
      soilMoisture: { type: 'number', required: false }
    },
    'Create irrigation schedule',
    'recommendation',
    { rateLimitPerMinute: 80 }
  );

  // ────────────────────────────────────────────────────────────
  // Monitoring Tools
  // ────────────────────────────────────────────────────────────

  toolPool.register(
    'field-health-monitor',
    async (context, input) => {
      // Monitor field health status
      const { farmId, fieldId } = input;

      return {
        fieldId,
        overallHealth: 'good',
        healthScore: 78,
        factors: {
          soilCondition: 85,
          cropGrowth: 72,
          irrigationStatus: 88,
          pestPresence: 'low'
        },
        alerts: [
          { type: 'warning', message: 'Slight nitrogen deficiency detected' },
          { type: 'info', message: 'Next irrigation recommended in 3 days' }
        ],
        lastUpdated: new Date()
      };
    },
    {
      farmId: { type: 'string', required: true },
      fieldId: { type: 'string', required: false }
    },
    'Monitor field health and get alerts',
    'monitoring',
    { rateLimitPerMinute: 300 }
  );

  toolPool.register(
    'market-opportunity-finder',
    async (context, input) => {
      // Find market opportunities
      const { crop, quantity } = input;

      return {
        crop,
        quantity,
        currentPrice: 2500,
        trend: 'upward',
        opportunities: [
          { buyer: 'Local mill', price: 2520, volume: quantity },
          { buyer: 'Cooperative', price: 2480, volume: 'unlimited' },
          { buyer: 'Export trader', price: 2600, volume: quantity * 2 }
        ],
        bestOption: 'Export trader',
        estimatedRevenue: quantity * 2600
      };
    },
    {
      crop: { type: 'string', required: true },
      quantity: { type: 'number', required: true }
    },
    'Find market opportunities and buyers',
    'recommendation',
    { rateLimitPerMinute: 100 }
  );

  console.log('✓ Example tools registered');
}

/**
 * Example: How to invoke tools
 */
async function exampleToolInvocation(toolPool, context) {
  try {
    // Calculate nutrients
    const nutrients = await toolPool.invoke('soil-nutrient-calculator', context, {
      crop: 'rice',
      soilData: { nitrogen: 30, phosphorus: 10, potassium: 100 },
      areaHectares: 2
    });
    console.log('Nutrient Requirements:', nutrients);

    // Identify pests
    const pests = await toolPool.invoke('pest-identifier', context, {
      symptomDescription: 'Yellow leaves with brown spots',
      cropType: 'rice'
    });
    console.log('Pest Identification:', pests);

    // Predict yield
    const yield_pred = await toolPool.invoke('yield-predictor', context, {
      crop: 'rice',
      soilHealth: 75,
      weatherConditions: 'moderate',
      managementLevel: 'high'
    });
    console.log('Yield Prediction:', yield_pred);

    // Get rotation recommendation
    const rotation = await toolPool.invoke('crop-rotation-recommender', context, {
      currentCrop: 'rice',
      soilHealth: 75
    });
    console.log('Crop Rotation:', rotation);

  } catch (error) {
    console.error('Tool invocation error:', error);
  }
}

/**
 * Example: Get tool pool statistics
 */
function exampleToolPoolStats(toolPool) {
  const stats = toolPool.getStats();
  console.log('Tool Pool Statistics:', stats);

  const markdown = toolPool.renderMarkdown();
  console.log('\nTool Pool Markdown:\n', markdown);
}

module.exports = {
  initializeExampleTools,
  exampleToolInvocation,
  exampleToolPoolStats
};
