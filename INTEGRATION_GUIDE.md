# AgriTech AI - Claw Code Integration Guide

## Quick Start

### 1. Backend: Initialize Command & Tool System

```javascript
// In your server initialization or a startup script
const CommandRegistry = require('./core/CommandRegistry');
const ToolPool = require('./core/ToolPool');
const QueryRouter = require('./core/QueryRouter');
const { SessionManager } = require('./core/SessionManager');
const { initializeExampleCommands } = require('./core/exampleCommands');
const { initializeExampleTools } = require('./core/exampleTools');

// Create instances
const commandRegistry = new CommandRegistry();
const toolPool = new ToolPool({ simpleMode: false });
const sessionManager = new SessionManager('./data/sessions');
const queryRouter = new QueryRouter(commandRegistry, toolPool);

// Initialize default commands and tools
initializeExampleCommands(commandRegistry);
initializeExampleTools(toolPool);

// Initialize sessions
await sessionManager.init();

// Export for use in routes
module.exports = {
  commandRegistry,
  toolPool,
  sessionManager,
  queryRouter
};
```

### 2. Backend: Register Custom Commands

```javascript
const { commandRegistry } = require('./path/to/initialized-system');

// Register your farm analysis command
commandRegistry.register(
  'analyze-farm-health',
  async (context, params) => {
    // Implementation
    const farm = await Farm.findById(context.farmId);
    const soilData = await SoilReading.find({ farmId: context.farmId }).sort({ createdAt: -1 }).limit(1);
    const cropData = await Crop.find({ farmId: context.farmId });
    
    return {
      farmId: context.farmId,
      farmName: farm.name,
      soilHealth: soilData[0]?.healthScore || 0,
      crops: cropData.length,
      overallHealth: 'good'
    };
  },
  'Analyze overall farm health and provide recommendations',
  'farm',
  ['read:farm', 'read:soil']
);
```

### 3. Backend: Register Custom Tools

```javascript
const { toolPool } = require('./path/to/initialized-system');

// Register your disease identification tool
toolPool.register(
  'ml-disease-detector',
  async (context, input) => {
    // Call your ML service
    const response = await axios.post('http://localhost:5001/predict/disease', {
      image: input.imageBase64,
      cropType: input.cropType
    });
    
    return response.data;
  },
  {
    imageBase64: { type: 'string', required: true },
    cropType: { type: 'string', required: true }
  },
  'Detect crop diseases using ML model',
  'analysis',
  { rateLimitPerMinute: 100, experimental: false }
);
```

### 4. Frontend: Use Enhanced API Manager

```javascript
import { commandAPI, serviceManager } from './services/apiManager';

// Execute a command query
async function askAboutFarm() {
  try {
    const result = await commandAPI.query(
      'What is the health status of my farm?',
      sessionId,
      farmId
    );
    
    console.log('Session ID:', result.sessionId);
    console.log('Turn Number:', result.turnNumber);
    console.log('Response:', result.result.output);
  } catch (error) {
    console.error('Query failed:', error);
  }
}

// Get system statistics
async function displayStats() {
  const stats = await commandAPI.getStats();
  console.log('Total commands executed:', stats.commands.totalExecutions);
  console.log('Success rate:', stats.commands.successCount / stats.commands.totalExecutions);
}

// Manage sessions
async function manageSessions() {
  const sessions = await commandAPI.getSessions();
  sessions.forEach(session => {
    console.log(`Session ${session.sessionId}: ${session.turnCount} turns`);
  });
}
```

### 5. ML Service: Register Modules

```python
from module_registry import ModuleRegistry, ModuleConfig

registry = ModuleRegistry()

# Register crop disease detector
config = ModuleConfig(
    name="crop-disease-detector",
    category="analysis",
    description="Detect crop diseases from images",
    required_env_vars=["OPENAI_API_KEY"],
    timeout_seconds=30
)

async def detect_disease(input_data):
    image_base64 = input_data['image']
    crop_type = input_data['crop_type']
    
    # Call OpenAI Vision API
    response = client.chat.completions.create(
        model="gpt-4-vision",
        messages=[...],
    )
    
    return {
        "disease": response.choices[0].message.content,
        "confidence": 0.95,
        "treatment": "..."
    }

registry.register(config, detect_disease)
await registry.initialize_all()
```

---

## Architecture Patterns

### Pattern 1: Command Query Flow

```
User Input (Frontend)
    ↓
POST /api/command/query
    ↓
QueryRouter.processQuery()
    ↓
QueryRouter.route() → Match commands/tools
    ↓
QueryRouter.executeRoute() → Execute best match
    ↓
SessionManager.addTurn() → Save to session
    ↓
Response to Frontend
```

### Pattern 2: Tool Invocation Flow

```
Frontend API Call
    ↓
ToolPool.invoke()
    ↓
Check Rate Limit
    ↓
Check Permissions
    ↓
Validate Input
    ↓
Execute Tool
    ↓
Log Execution
    ↓
Return Result
```

### Pattern 3: Session Management Flow

```
Create Session
    ↓
User asks question
    ↓
Process Query & Add Turn
    ↓
Save Session to Disk
    ↓
User asks follow-up
    ↓
Load Session from Disk
    ↓
Add Turn & Save
    ↓
Close Session
    ↓
Export as Markdown
```

---

## Common Tasks

### Task 1: Add a New Farmer Command

```javascript
// In your command registration file
commandRegistry.register(
  'get-fertilizer-recommendation',
  async (context, params) => {
    const farm = await Farm.findById(context.farmId);
    const soil = await SoilReading.findLatestByFarm(context.farmId);
    const crop = params.cropType;
    
    // Call recommendation logic
    const recommendation = await recommendFertilizer(crop, soil);
    
    return {
      crop,
      fertilizer: recommendation.name,
      quantity: recommendation.quantityPerHectare,
      timing: recommendation.applicationTiming,
      cost: recommendation.estimatedCost
    };
  },
  'Get fertilizer recommendation for a crop',
  'farm',
  ['read:farm', 'read:soil']
);
```

**Then use from frontend:**
```javascript
const result = await commandAPI.query(
  'What fertilizer should I use for my rice?',
  sessionId,
  farmId
);
```

### Task 2: Add a New Analysis Tool

```javascript
toolPool.register(
  'advanced-soil-analyzer',
  async (context, input) => {
    const { farmId, sampleType } = input;
    
    // Fetch or analyze
    const analysis = await performAdvancedAnalysis(farmId, sampleType);
    
    return {
      ph: analysis.ph,
      ec: analysis.electricalConductivity,
      nutrients: analysis.nutrients,
      organicMatter: analysis.organicMatter,
      recommendations: analysis.recommendations
    };
  },
  {
    farmId: { type: 'string', required: true },
    sampleType: { type: 'string', required: true }
  },
  'Perform advanced soil analysis',
  'analysis',
  { rateLimitPerMinute: 50, requiredPermissions: ['admin:soil'] }
);
```

### Task 3: Monitor System Statistics

```javascript
// Get real-time stats
const stats = await commandAPI.getStats();

console.log('System Health:');
console.log('- Commands registered:', stats.commands.totalExecutions);
console.log('- Success rate:', (stats.commands.successCount / stats.commands.totalExecutions * 100).toFixed(2) + '%');
console.log('- Avg response time:', stats.commands.avgDuration.toFixed(0) + 'ms');
console.log('- Tool utilization:', stats.tools.byCategory);
console.log('- Active sessions:', stats.sessions.activeSessions);
```

### Task 4: Export User Conversation

```javascript
// Export as markdown
const markdown = await sessionManager.exportSessionMarkdown(sessionId);
console.log(markdown);

// Would produce:
/*
# Session abc123

**User:** user123
**Farm:** farm123
**Created:** 2024-03-20T10:30:00Z

## Conversation

### Turn 1
**Prompt:** What is my soil health?
**Response:** Your soil health score is 78/100...

### Turn 2
**Prompt:** How can I improve it?
**Response:** You can improve soil health by...
*/
```

### Task 5: Track Command Performance

```javascript
// Get command-specific stats
const stats = commandRegistry.getStats();

stats.byCommand.forEach(cmd => {
  console.log(`${cmd.name}:`);
  console.log(`  Executions: ${cmd.count}`);
  console.log(`  Errors: ${cmd.errors}`);
  console.log(`  Error rate: ${(cmd.errors / cmd.count * 100).toFixed(2)}%`);
});
```

---

## File Organization Best Practices

### Organizing Commands

```
backend/commands/
├── farm/
│   ├── farmStatus.js
│   ├── farmInfo.js
│   └── index.js        # Export all farm commands
├── soil/
│   ├── soilAnalysis.js
│   ├── soilHistory.js
│   └── index.js
├── crop/
│   ├── cropHealth.js
│   ├── cropSchedule.js
│   └── index.js
└── index.js            # Master command registration
```

### Organizing Tools

```
backend/tools/
├── analysis/
│   ├── diseaseDetector.js
│   ├── nutrientCalculator.js
│   └── index.js
├── prediction/
│   ├── yieldPredictor.js
│   ├── weatherImpact.js
│   └── index.js
└── index.js            # Master tool registration
```

### Startup

```javascript
// In server.js
const { registerAllCommands } = require('./commands');
const { registerAllTools } = require('./tools');

// Initialize
const { commandRegistry, toolPool } = require('./core');
registerAllCommands(commandRegistry);
registerAllTools(toolPool);
```

---

## Troubleshooting

### Issue: "Command not found"
**Solution:** Ensure command is registered before route is used
```javascript
// Verify
console.log(commandRegistry.getAll().map(c => c.name));
```

### Issue: "Permission denied"
**Solution:** Check user permissions and command requirements
```javascript
const cmd = commandRegistry.get('command-name');
console.log('Required:', cmd.permissions);
console.log('User has:', context.user.permissions);
```

### Issue: "Rate limit exceeded"
**Solution:** Increase rate limit or add caching
```javascript
tool.rateLimitPerMinute = 200; // Increase
toolPool.setToolEnabled('tool-name', true); // Re-enable
```

### Issue: "Session not found"
**Solution:** Ensure session exists and is not closed
```javascript
const session = await sessionManager.getSession(sessionId);
if (!session) {
  // Create new session
  session = await sessionManager.createSession(userId, farmId);
}
```

---

## Performance Optimization

### Enable Caching
```javascript
// Tools automatically cache with TTL
const tool = toolPool.get('tool-name');
tool.config.cache_enabled = true;
tool.config.cache_ttl_seconds = 3600;
```

### Implement Command Batching
```javascript
// Execute multiple commands efficiently
const results = await Promise.all([
  commandRegistry.execute('cmd1', context),
  commandRegistry.execute('cmd2', context),
  commandRegistry.execute('cmd3', context)
]);
```

### Use Session Compression
```javascript
// Periodically compress old sessions
await sessionManager.cleanup();
```

---

## Further Reading

- [Claw Code GitHub](https://github.com/instructkr/claw-code)
- [Command Pattern](https://refactoring.guru/design-patterns/command)
- [Registry Pattern](https://refactoring.guru/design-patterns/registry)
- [Session Management Best Practices](https://owasp.org/www-community/attacks/Session_fixation)
