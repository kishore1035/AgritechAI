# AgriTech AI - Enhanced with Claw Code Architectural Patterns

## Overview

AgriTech AI has been significantly enhanced by integrating architectural patterns and best practices from **Claw Code**, an advanced AI runtime system. These enhancements provide:

- **Centralized Command Management** - Registry pattern for farmer commands
- **Tool Pool Architecture** - Unified tool discovery and execution
- **Query Routing System** - Intelligent routing of natural language queries to commands/tools
- **Session Persistence** - User session management with conversation history
- **Module Registry** - ML service module discovery and lifecycle management
- **Comprehensive Logging & Stats** - Execution tracking and analytics

---

## Architecture Components

### 1. Backend Command System (Node.js)

#### **CommandRegistry** (`backend/core/CommandRegistry.js`)

Central registry for all farmer commands and workflows.

```javascript
// Usage example
const CommandRegistry = require('./core/CommandRegistry');
const registry = new CommandRegistry();

// Register a command
registry.register(
  'analyze-soil',
  async (context, params) => {
    // Command implementation
  },
  'Analyze soil health for a farm',
  'soil', // scope
  ['read:soil', 'write:analysis']
);

// Execute a command
const result = await registry.execute('analyze-soil', context, params);
```

**Features:**
- Scope-based organization (farm, soil, weather, market)
- Permission-based access control
- Execution logging and tracking
- Fuzzy command matching
- Performance statistics

#### **ToolPool** (`backend/core/ToolPool.js`)

Centralized management of available tools/capabilities.

```javascript
// Register a tool
toolPool.register(
  'nutrient-calculator',
  async (context, input) => {
    // Tool implementation
  },
  { /* schema */ },
  'Calculate nutrient requirements',
  'analysis', // category
  { 
    rateLimitPerMinute: 100,
    requiredPermissions: ['read:farm']
  }
);

// Find tools
const matches = toolPool.findByQuery('nutrient', limit: 5);

// Invoke tool
const result = await toolPool.invoke('nutrient-calculator', context, input);
```

**Features:**
- Category-based organization (analysis, prediction, recommendation, monitoring)
- Rate limiting per user/minute
- Permission checking
- Experimental tool mode
- Input validation
- Cache support
- Invocation logging

#### **QueryRouter** (`backend/core/QueryRouter.js`)

Routes farmer queries to appropriate commands and tools.

```javascript
// Create router
const queryRouter = new QueryRouter(commandRegistry, toolPool);

// Route a query
const route = queryRouter.route('Tell me about soil health', limit: 5);
// Returns: { matchedCommands: [...], matchedTools: [...], confidence: ... }

// Execute routed query
const result = await queryRouter.executeRoute(route, context, params);

// Process end-to-end
const result = await queryRouter.processQuery(
  'Analyze my farm soil',
  context,
  {},
  { maxAttempts: 1, fallbackToGeneric: true }
);
```

**Features:**
- Fuzzy matching on commands and tools
- Confidence scoring
- Multi-attempt fallback
- Suggestion generation
- Routing history and analytics
- Markdown rendering

#### **SessionManager** (`backend/core/SessionManager.js`)

Persistent session management for user conversations.

```javascript
// Create session
const session = await sessionManager.createSession(userId, farmId);

// Add turns to session
await sessionManager.addTurn(session.sessionId, prompt, result);

// Retrieve sessions
const userSessions = await sessionManager.getUserSessions(userId, limit: 50);

// Export session
const markdown = await sessionManager.exportSessionMarkdown(sessionId);
```

**Features:**
- Per-user session management
- Disk persistence (JSON files in `data/sessions/`)
- Turn-based conversation history
- Session metadata and tagging
- Automatic cleanup of old sessions
- Markdown export
- Session statistics

#### **ExecutionContext** (`backend/core/types.js`)

Rich context object for command/tool execution.

```javascript
const context = new ExecutionContext(userId, farmId, sessionId);

// Record execution
context.recordExecution('command-name', result, duration);

// Record errors
context.recordError(error);

// JSON export
const json = context.toJSON();
```

---

### 2. API Routing

#### **Command Route** (`backend/routes/command.js`)

REST endpoints for command execution and session management.

```
POST   /api/command/query                 - Execute a query
GET    /api/command/route/:query          - Get routing info without executing
GET    /api/command/sessions/:sessionId   - Get session details
GET    /api/command/user/sessions         - List user's sessions
POST   /api/command/sessions/:id/close    - Close a session
GET    /api/command/registry              - List all commands
GET    /api/command/tools                 - List all tools
GET    /api/command/stats                 - Get system statistics
GET    /api/command/health                - Health check
```

**Example Query:**
```bash
curl -X POST http://localhost:5000/api/command/query \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How should I treat leaf spots on my tomatoes?",
    "farmId": "farm123"
  }'
```

**Response:**
```json
{
  "success": true,
  "sessionId": "session-uuid",
  "turnNumber": 1,
  "result": {
    "prompt": "How should I treat leaf spots on my tomatoes?",
    "output": "...",
    "matchedRoute": {...},
    "executedTools": [],
    "usage": {...}
  }
}
```

---

### 3. ML Service Module System (Python)

#### **ModuleRegistry** (`ml-service/module_registry.py`)

Centralized registry for ML models and analyzers.

```python
from module_registry import ModuleRegistry, ModuleConfig

registry = ModuleRegistry()

# Register a module
config = ModuleConfig(
    name="nutrient-predictor",
    category="prediction",
    description="Predict nutrient deficiencies",
    required_env_vars=["OPENAI_API_KEY"],
    timeout_seconds=30
)

async def nutrient_executor(input_data):
    # Module implementation
    pass

registry.register(config, nutrient_executor)

# Initialize all modules
await registry.initialize_all()

# Execute a module
result = await registry.execute_module("nutrient-predictor", input_data)

# Get statistics
stats = registry.get_stats()
markdown = registry.render_markdown()
```

**Features:**
- Module versioning
- Dependency tracking
- Startup/shutdown lifecycle
- Execution caching with TTL
- Input size validation
- Timeout protection
- Statistics and logging
- Status tracking (PLANNED → LOADING → READY → ERROR)

---

### 4. Frontend API Manager

#### **APIManager** (`frontend/src/services/apiManager.js`)

Enhanced API service with Claw Code patterns.

```javascript
import { serviceManager, commandAPI, cropsAPI } from './apiManager';

// Execute a command query
const result = await commandAPI.query(
  'Tell me about soil health',
  sessionId,
  farmId
);

// Get routing information
const routing = await commandAPI.getRoute('nutrient analysis');

// Session management
const sessions = await commandAPI.getSessions();
const session = await commandAPI.getSession(sessionId);
await commandAPI.closeSession(sessionId);

// System statistics
const stats = await commandAPI.getStats();
const registry = await commandAPI.getRegistry();
const tools = await commandAPI.getTools();

// Service manager
console.log(serviceManager.getStats());
console.log(serviceManager.renderMarkdown());
```

**Features:**
- Centralized service registration
- Endpoint versioning
- Request/response logging
- Execution timing
- Error aggregation
- Statistics by endpoint
- Markdown rendering
- Auth token management

---

## Data Types & Models

### Core Types (`backend/core/types.js`)

#### **CommandEntry**
```javascript
{
  name: string,
  description: string,
  scope: 'farm' | 'soil' | 'weather' | 'market',
  permissions: string[],
  handler: async Function
}
```

#### **ToolEntry**
```javascript
{
  name: string,
  description: string,
  category: 'analysis' | 'prediction' | 'recommendation' | 'monitoring',
  schema: ValidationSchema,
  executor: async Function,
  rateLimitPerMinute: number
}
```

#### **ExecutionContext**
```javascript
{
  userId: string,
  farmId: string | null,
  sessionId: string | null,
  executionHistory: Array<{command, result, duration, timestamp}>,
  errors: Array<{message, stack, timestamp}>
}
```

#### **TurnResult**
```javascript
{
  prompt: string,
  output: string,
  matchedRoute: QueryRoute,
  executedCommands: Array,
  executedTools: Array,
  permissionDenials: Array,
  usage: {inputTokens, outputTokens, timestamp},
  stopReason: 'success' | 'max_retries_exceeded' | 'no_match' | ...
}
```

---

## Usage Examples

### Example 1: Basic Command Query

```javascript
// Frontend
const result = await commandAPI.query(
  "What fertilizer should I use for my rice farm?",
  sessionId,
  farmId
);
```

### Example 2: Tool-Specific Execution

```javascript
// Frontend
const soilAnalysis = await cropsAPI.analyzeCrop(formData);
// → Backend receives image
// → Calls ML service crop-analysis endpoint
// → Stores result in CropAnalysis model
// → Returns analysis with health score, issues, tips
```

### Example 3: Session Management

```javascript
// Get all sessions
const sessions = await commandAPI.getSessions();

// Export session as markdown
const markdown = await sessionManager.exportSessionMarkdown(sessionId);

// Close session when done
await commandAPI.closeSession(sessionId);
```

### Example 4: System Statistics

```javascript
const stats = await commandAPI.getStats();
// Returns:
// {
//   routing: {
//     totalQueries,
//     avgConfidence,
//     queriesWithMatches,
//     matchByType: {...}
//   },
//   commands: {
//     totalExecutions,
//     successCount,
//     errorCount,
//     avgDuration,
//     byCommand: {...}
//   },
//   tools: {...},
//   sessions: {...}
// }
```

---

## Benefits from Claw Code Integration

### 1. **Centralized Management**
- Single source of truth for commands and tools
- Prevents command duplication
- Easy discovery and documentation

### 2. **Permission & Access Control**
- Fine-grained permission checking
- Tool-level access restrictions
- Audit trail of command execution

### 3. **Intelligent Routing**
- Natural language query understanding
- Fuzzy matching for user-friendly interface
- Suggestions when no exact match found
- Confidence scoring

### 4. **Session Persistence**
- Conversation history per user
- Session export and replay
- Multi-session management
- Automatic cleanup

### 5. **Performance & Observability**
- Command execution timing
- Tool invocation statistics
- Rate limiting per user
- Error tracking and aggregation
- Routing analytics

### 6. **Scalability**
- Module-based ML service architecture
- Tool pool for capability discovery
- Command registry for workflow management
- Rate limiting to prevent abuse

---

## File Structure

```
agritech-ai/
├── backend/
│   ├── core/
│   │   ├── types.js              # Core data structures
│   │   ├── CommandRegistry.js     # Command management
│   │   ├── ToolPool.js            # Tool management
│   │   ├── QueryRouter.js         # Query routing
│   │   └── SessionManager.js      # Session persistence
│   ├── routes/
│   │   ├── command.js             # Command API endpoints
│   │   ├── cropAnalysis.js        # Crop analysis endpoints
│   │   └── ... (existing routes)
│   └── server.js                  # Server setup
├── ml-service/
│   ├── module_registry.py         # ML module management
│   ├── routers/
│   │   ├── predictions.py         # Prediction endpoints
│   │   └── ... (existing routers)
│   └── app.py                     # FastAPI setup
└── frontend/
    ├── src/
    │   ├── services/
    │   │   ├── apiManager.js       # Enhanced API manager
    │   │   └── api.js              # Existing API service
    │   ├── pages/
    │   │   ├── PlantScanner.jsx    # Crop analysis UI
    │   │   └── ... (existing pages)
    │   └── components/
    │       ├── CropHealthScanner.jsx
    │       └── ... (existing components)
```

---

## Next Steps

1. **Register Farm Commands** - Create commands for common farm operations
2. **Implement Tool Executors** - Wire up tools to actual business logic
3. **Add Permission Policies** - Define granular access control
4. **Dashboard Statistics** - Display command/tool usage in UI
5. **Command Suggestions** - Show suggested commands based on farm data
6. **ML Module Integration** - Register prediction and analysis modules

---

## References

- **Claw Code**: https://github.com/instructkr/claw-code
- **Runtime Patterns**: Command/Tool registry architecture from Claude Code
- **Module System**: Python module lifecycle from Claw implementation
- **API Design**: Service-oriented architecture with versioning and monitoring
