# 🎯 AgriTech AI - Quick Reference Card

## 🚀 Start Services (Open 3 Terminals)

```bash
# Terminal 1: Backend API
cd backend
npm start
# Runs on http://localhost:5000

# Terminal 2: ML Service
cd ml-service
python app.py
# Runs on http://localhost:5001

# Terminal 3: Frontend
cd frontend
npm run dev
# Runs on http://localhost:5173
```

---

## 🔐 Test Login

```
Phone: 9998887776
Password: password123
```

---

## ✅ Quick Health Checks

```bash
# Backend
curl http://localhost:5000/health

# ML Service
curl http://localhost:5001/health
```

---

## 🧪 Test Key Endpoints

### 1. Get Current Weather
```bash
# Replace YOUR_TOKEN with actual token from login
curl "http://localhost:5000/api/weather/data/current-weather?location=Bangalore" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Predict Soil Health
```bash
curl -X POST http://localhost:5000/api/predictions/soil-health \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "nitrogen": 50,
    "phosphorus": 40,
    "potassium": 60,
    "pH": 6.5,
    "moisture": 60,
    "organicMatter": 3.5
  }'
```

### 3. Predict Crop Yield
```bash
curl -X POST http://localhost:5000/api/predictions/crop-yield \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "cropName": "rice",
    "area": 2.5,
    "nitrogen": 50,
    "phosphorus": 40,
    "potassium": 60,
    "rainfall": 800,
    "temperature": 25
  }'
```

### 4. Check ML Service Status
```bash
curl http://localhost:5000/api/predictions/health/ml-service \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📁 Key Files Updated

### SessionManager
```javascript
const session = await sessionManager.createSession(userId, farmId);
await sessionManager.addTurn(sessionId, prompt, result);
const sessions = await sessionManager.getUserSessions(userId);
const markdown = await sessionManager.exportSessionMarkdown(sessionId);
```

---

## API Endpoints Quick Reference

```bash
# Execute query
POST /api/command/query
{
  "query": "What's my soil health?",
  "farmId": "farm123",
  "sessionId": "session123"
}

# Get routing info
GET /api/command/route/:query

# Session management
GET    /api/command/sessions/:sessionId
GET    /api/command/user/sessions
POST   /api/command/sessions/:id/close

# System info
GET /api/command/registry     # All commands
GET /api/command/tools        # All tools
GET /api/command/stats        # Statistics
GET /api/command/health       # Health check
```

---

## Frontend API Quick Reference

```javascript
import { commandAPI, serviceManager } from './services/apiManager';

// Queries
await commandAPI.query(query, sessionId, farmId);
await commandAPI.getRoute(query);
await commandAPI.getSuggestions(query);

// Sessions
await commandAPI.getSessions();
await commandAPI.getSession(sessionId);
await commandAPI.closeSession(sessionId);

// System
await commandAPI.getStats();
await commandAPI.getRegistry();
await commandAPI.getTools();

// Service Manager
serviceManager.getStats();
serviceManager.renderMarkdown();
```

---

## Creating a Command

```javascript
commandRegistry.register(
  'command-name',                           // Unique name
  async (context, params) => {              // Handler function
    return { /* result */ };
  },
  'Human readable description',             // Description
  'farm',                                   // Scope
  ['read:farm', 'write:analysis']          // Permissions
);
```

---

## Creating a Tool

```javascript
toolPool.register(
  'tool-name',                              // Unique name
  async (context, input) => {               // Executor function
    return { /* result */ };
  },
  { param1: { required: true } },          // Input schema
  'Human readable description',             // Description
  'analysis',                               // Category
  { rateLimitPerMinute: 100 }              // Options
);
```

---

## Data Models

```javascript
// ExecutionContext
{
  userId: string,
  farmId: string,
  sessionId: string,
  executionHistory: [],
  errors: []
}

// TurnResult
{
  prompt: string,
  output: string,
  matchedRoute: {},
  executedCommands: [],
  executedTools: [],
  usage: { inputTokens, outputTokens },
  stopReason: 'success' | 'error' | 'no_match'
}

// QueryRoute
{
  query: string,
  matchedCommands: [],
  matchedTools: [],
  confidence: 0-100
}
```

---

## Common Operations

### Register Command
```javascript
commandRegistry.register('cmd', handler, 'desc', 'farm', ['read:farm']);
```

### Execute Command
```javascript
const result = await commandRegistry.execute('cmd', context, params);
```

### Register Tool
```javascript
toolPool.register('tool', executor, schema, 'desc', 'category', options);
```

### Invoke Tool
```javascript
const result = await toolPool.invoke('tool', context, input);
```

### Create Session
```javascript
const session = await sessionManager.createSession(userId, farmId);
```

### Query System
```javascript
const result = await queryRouter.processQuery(query, context);
```

### Get Statistics
```javascript
const stats = await commandAPI.getStats();
```

### Export Session
```javascript
const md = await sessionManager.exportSessionMarkdown(sessionId);
```

---

## Scopes (for Commands)
- `farm` - Farm management
- `soil` - Soil analysis
- `weather` - Weather data
- `market` - Market info
- `general` - General commands

---

## Categories (for Tools)
- `analysis` - Data analysis tools
- `prediction` - ML predictions
- `recommendation` - Recommendations
- `monitoring` - Monitoring tools
- `processing` - Data processing

---

## Key Statistics

```javascript
// From commandAPI.getStats()
{
  routing: {
    totalQueries,
    avgConfidence,
    queriesWithMatches,
    matchByType: {}
  },
  commands: {
    totalExecutions,
    successCount,
    errorCount,
    avgDuration,
    byCommand: {}
  },
  tools: { /* similar */ },
  sessions: {
    totalSessions,
    activeSessions,
    totalTurns,
    avgTurnsPerSession
  }
}
```

---

## Permission Examples

- `read:farm` - Can read farm data
- `write:farm` - Can modify farm data
- `read:soil` - Can read soil data
- `write:soil` - Can modify soil data
- `read:crop` - Can read crop data
- `admin:*` - Admin access all
- `*` - Super user access all

---

## Error Handling

```javascript
try {
  const result = await commandAPI.query(query, sessionId, farmId);
} catch (error) {
  // error.response.status = 400/401/403/404/500
  // error.response.data.error = error message
  
  if (error.response?.status === 401) {
    // Re-authenticate
  } else if (error.response?.status === 403) {
    // Permission denied
  } else if (error.response?.status === 404) {
    // Not found
  }
}
```

---

## Rate Limiting

- Default: 60 requests per minute per user per tool
- Custom: Set `rateLimitPerMinute` on tool options
- Storage: In-memory (reset on server restart)
- Status: 429 Too Many Requests when exceeded

---

## Caching

- Enabled by default on tools
- TTL: 1 hour default
- Key: String representation of input params
- Clear cache: `toolPool.get('tool-name').clearCache()`

---

## Session Persistence

- Location: `data/sessions/` directory
- Format: JSON files (one per session)
- Retention: 30 days by default
- Cleanup: `sessionManager.cleanup()` removes old sessions

---

## ML Module Status

- `PLANNED` - Module defined but not initialized
- `LOADING` - Module initializing
- `READY` - Module ready for use
- `ERROR` - Module failed to initialize
- `DISABLED` - Module disabled intentionally

---

## Performance Tips

1. **Enable caching** for tools with deterministic outputs
2. **Batch operations** using Promise.all()
3. **Index sessions** for quick lookups
4. **Use rate limiting** to control resource usage
5. **Monitor stats** for bottlenecks

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Command not found | Check registration: `commandRegistry.getAll()` |
| Permission denied | Verify user permissions match command requirements |
| Tool rate limited | Increase `rateLimitPerMinute` or wait |
| Session lost | Check session exists: `getSession(id)` |
| Slow queries | Check query routing confidence and enable caching |

---

## File Locations

| Component | File |
|-----------|------|
| CommandRegistry | `backend/core/CommandRegistry.js` |
| ToolPool | `backend/core/ToolPool.js` |
| QueryRouter | `backend/core/QueryRouter.js` |
| SessionManager | `backend/core/SessionManager.js` |
| API Endpoints | `backend/routes/command.js` |
| Frontend API | `frontend/src/services/apiManager.js` |
| ML Modules | `ml-service/module_registry.py` |

---

## Documentation

- **Full Architecture**: `ARCHITECTURE_ENHANCEMENTS.md`
- **Integration Guide**: `INTEGRATION_GUIDE.md`
- **Summary**: `CLAW_CODE_ENHANCEMENTS_SUMMARY.md`
- **This File**: `QUICK_REFERENCE.md`

---

## Examples

- **Commands**: `backend/core/exampleCommands.js`
- **Tools**: `backend/core/exampleTools.js`

---

## Version

- **Claw Code Patterns**: v1.0
- **AgriTech Integration**: v1.0
- **Last Updated**: 2026-04-06
