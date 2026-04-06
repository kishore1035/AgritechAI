# AgriTech AI - Claw Code Architecture Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND (React)                                  │
│                                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ PlantScanner, Dashboard, etc.                                         │  │
│  └────────────────────┬────────────────────────────────────────────────┬─┘  │
│                       │                                                │    │
│  ┌────────────────────┴────────────────────────────────────────────────┴──┐ │
│  │           Enhanced API Manager (apiManager.js)                       │ │
│  │  • Service Registry                                                  │ │
│  │  • Request Logging                                                  │ │
│  │  • Statistics Collection                                            │ │
│  │  • Auth Token Management                                            │ │
│  └────────────────────┬────────────────────────────────────────────────┬─┘ │
└─────────────────────┼─────────────────────────────────────────────────┼───┘
                      │ HTTP/REST                               HTTP/REST│
                      ├─────────────────────────────────────────────────┤
                      ↓                                                   ↓
┌──────────────────────────────────────────────────────────────────────────────┐
│                          BACKEND (Node.js Express)                            │
│                                                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                     Command Router API                                   │ │
│  │  /api/command/query          POST   - Execute natural language query    │ │
│  │  /api/command/route/:query   GET    - Get routing info                  │ │
│  │  /api/command/sessions       GET    - List sessions                     │ │
│  │  /api/command/stats          GET    - System statistics                 │ │
│  │  /api/command/registry       GET    - List commands                     │ │
│  │  /api/command/tools          GET    - List tools                        │ │
│  └─────────────────┬──────────────────────────────────────────────────────┘ │
│                    │                                                         │
│  ┌─────────────────┴──────────────────────────────────────────────────────┐ │
│  │                      Query Processing Pipeline                          │ │
│  │                                                                          │ │
│  │   1. QueryRouter.route()      → Match commands & tools                  │ │
│  │        ↓                                                                │ │
│  │   2. Fuzzy matching          → Find best 5 matches                     │ │
│  │        ↓                                                                │ │
│  │   3. Confidence scoring      → Score each match                        │ │
│  │        ↓                                                                │ │
│  │   4. QueryRouter.executeRoute() → Execute best match                   │ │
│  │        ↓                                                                │ │
│  │   5. SessionManager.addTurn() → Save to session                        │ │
│  │        ↓                                                                │ │
│  │   6. Return result           → TurnResult to frontend                  │ │
│  │                                                                          │ │
│  └──────┬─────────────────────────────────────────────────────┬────────────┘ │
│         │                                                      │              │
└────────┼──────────────────────────────────────────────────────┼──────────────┘
         │                                                      │
    ┌────┴──────────────────────────────────────────────────────┴─────┐
    │                                                                  │
    ↓                                                                  ↓
┌──────────────────────────────────┐  ┌─────────────────────────────────────┐
│   COMMAND REGISTRY               │  │   TOOL POOL                          │
│                                  │  │                                      │
│ • Register commands              │  │ • Register tools                     │
│ • Organize by scope:             │  │ • Organize by category:              │
│   - farm                         │  │   - analysis                         │
│   - soil                         │  │   - prediction                       │
│   - weather                      │  │   - recommendation                   │
│   - market                       │  │   - monitoring                       │
│ • Fuzzy matching                 │  │ • Fuzzy search                       │
│ • Permission checking            │  │ • Rate limiting                      │
│ • Execution tracking             │  │ • Input validation                   │
│ • Statistics                     │  │ • Caching with TTL                   │
│                                  │  │ • Statistics & logging               │
│ Commands:                        │  │                                      │
│ - farm-status                    │  │ Tools:                               │
│ - soil-analysis                  │  │ - soil-nutrient-calculator           │
│ - crop-health                    │  │ - pest-identifier                    │
│ - weather-forecast               │  │ - yield-predictor                    │
│ - market-prices                  │  │ - crop-rotation-recommender          │
│ ...                              │  │ - irrigation-scheduler               │
└──────────────────────────────────┘  │ - market-opportunity-finder          │
                                       │ ...                                  │
                                       └─────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│   QUERY ROUTER                                                            │
│                                                                            │
│ Input: "What fertilizer for rice?"                                       │
│   ↓                                                                       │
│ Route() → Match against CommandRegistry                                 │
│   • farm-fertilizer: 85% match                                          │
│   • fertilizer-guide: 80% match                                         │
│   • soil-nutrient-calc: 75% match                                       │
│   ↓                                                                       │
│ Route() → Match against ToolPool                                        │
│   • nutrient-calculator: 82% match                                      │
│   • crop-recommender: 70% match                                         │
│   ↓                                                                       │
│ QueryRoute { matchedCommands: [...], matchedTools: [...] }             │
│   ↓                                                                       │
│ ExecuteRoute() → Pick best match (farm-fertilizer: 85%)                │
│   ↓                                                                       │
│ CommandRegistry.execute('farm-fertilizer', context, {crop: 'rice'})    │
│   ↓                                                                       │
│ TurnResult { prompt: "...", output: "NPK 12-60-60 recommended" }        │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│   SESSION MANAGER (Persistent)                                            │
│                                                                            │
│ Sessions stored in data/sessions/ directory                              │
│                                                                            │
│ Session Flow:                                                             │
│   1. Create session        → data/sessions/uuid.json                     │
│   2. Add Turn 1            → {prompt, result, timestamp}                 │
│   3. Save to disk          → JSON file updated                           │
│   4. User adds Turn 2      → Load from disk, append turn                 │
│   5. Save to disk          → JSON file updated                           │
│   6. Export                → Markdown format for user                    │
│   7. Close session         → Mark as inactive in JSON                    │
│   8. Auto cleanup          → Delete old sessions (30+ days)              │
│                                                                            │
│ Each session file:                                                        │
│ {                                                                          │
│   "sessionId": "abc123",                                                 │
│   "userId": "user1",                                                     │
│   "farmId": "farm1",                                                     │
│   "createdAt": "2024-03-20T10:30:00Z",                                  │
│   "turns": [                                                             │
│     {                                                                     │
│       "number": 1,                                                       │
│       "prompt": "What's my soil health?",                               │
│       "result": {                                                        │
│         "output": "Your soil health score is 78/100...",               │
│         "usage": {...}                                                  │
│       },                                                                 │
│       "timestamp": "2024-03-20T10:30:15Z"                              │
│     },                                                                   │
│     ...                                                                   │
│   ]                                                                       │
│ }                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
User enters query                              Farmer asks: "How should I
in Frontend                                    fertilize my rice?"
    │
    ↓
Frontend API Call
    │
    POST /api/command/query
    {
      "query": "How should I fertilize my rice?",
      "sessionId": "session123",
      "farmId": "farm123"
    }
    │
    ↓
Backend Command Router
    │
    ├─ Check auth
    ├─ Create/Load session
    │
    ├─ QueryRouter.processQuery()
    │  │
    │  ├─ QueryRouter.route(query)
    │  │  │
    │  │  ├─ CommandRegistry.getByQuery("fertilize rice")
    │  │  │  Returns: [
    │  │  │    {name: "farm-fertilizer", score: 85},
    │  │  │    {name: "soil-nutrient-calc", score: 75}
    │  │  │  ]
    │  │  │
    │  │  ├─ ToolPool.findByQuery("fertilize rice")
    │  │  │  Returns: [
    │  │  │    {name: "nutrient-calculator", score: 82},
    │  │  │    {name: "crop-recommender", score: 70}
    │  │  │  ]
    │  │  │
    │  │  └─ Return QueryRoute
    │  │     {
    │  │       matchedCommands: [...],
    │  │       matchedTools: [...],
    │  │       confidence: 85
    │  │     }
    │  │
    │  ├─ QueryRouter.executeRoute(route)
    │  │  │
    │  │  ├─ Get best match: farm-fertilizer (85%)
    │  │  │
    │  │  ├─ CommandRegistry.execute("farm-fertilizer", context, params)
    │  │  │  │
    │  │  │  ├─ Check permissions [read:farm] - OK
    │  │  │  │
    │  │  │  ├─ Get farm data
    │  │  │  ├─ Get soil data
    │  │  │  ├─ Get crop type: rice
    │  │  │  │
    │  │  │  └─ Execute handler
    │  │  │     {
    │  │  │       fertilizer: "NPK 12-60-60",
    │  │  │       quantity: 50,
    │  │  │       timing: "Before planting",
    │  │  │       cost: ₹2500
    │  │  │     }
    │  │  │
    │  │  └─ Return TurnResult
    │  │     {
    │  │       prompt: "How should I fertilize my rice?",
    │  │       output: "Based on your soil...",
    │  │       executedCommands: ["farm-fertilizer"],
    │  │       usage: {inputTokens: 8, outputTokens: 42}
    │  │     }
    │  │
    │  └─ SessionManager.addTurn(sessionId, prompt, result)
    │     │
    │     ├─ Load session from memory/disk
    │     ├─ Add turn to session
    │     ├─ Save to disk (data/sessions/session123.json)
    │     └─ Return updated session
    │
    ├─ Log execution
    ├─ Update statistics
    │
    └─ Return response to frontend
       {
         "success": true,
         "sessionId": "session123",
         "turnNumber": 1,
         "result": {
           "prompt": "How should I fertilize my rice?",
           "output": "Based on your soil analysis...",
           "usage": {...}
         }
       }
    │
    ↓
Frontend displays response
    │
    User sees recommendation
    │
    ↓
User asks follow-up question (Turn 2)
    │
    Repeat process...
```

---

## Rate Limiting & Permissions Flow

```
User tries to invoke tool
    │
    ↓
ToolPool.invoke("nutrient-calculator", context, input)
    │
    ├─ Check if tool exists          → YES, continue
    │
    ├─ Check if tool enabled         → YES, continue
    │
    ├─ Check permissions
    │  │
    │  ├─ Get user permissions: [read:farm, read:soil]
    │  ├─ Get tool requirements: [read:soil]
    │  │
    │  ├─ User has all required? → YES, continue
    │  │
    │  └─ If NO → Deny access, log permission denial
    │
    ├─ Check rate limit
    │  │
    │  ├─ Get tool limit: 100 calls/minute
    │  ├─ Get user calls this minute: 42
    │  │
    │  ├─ User under limit? → YES (42 < 100), continue
    │  │
    │  └─ If NO → Deny with 429 Too Many Requests
    │
    ├─ Validate input
    │  │
    │  ├─ Schema: {crop: required, soilData: required}
    │  ├─ Input: {crop: "rice", soilData: {...}}
    │  │
    │  ├─ Valid? → YES, continue
    │  │
    │  └─ If NO → Deny with validation error
    │
    ├─ Check cache
    │  │
    │  ├─ Cache key: "nutrient-calculator:rice:{...}"
    │  ├─ Found in cache? → YES, return cached result
    │  │
    │  └─ If NO → Continue to execution
    │
    ├─ Execute tool
    │  │
    │  ├─ Start timing
    │  ├─ Call executor function
    │  ├─ End timing
    │  │
    │  └─ Return result
    │
    ├─ Cache result (if cacheable)
    │  │
    │  ├─ Set TTL: 3600 seconds
    │  └─ Store in cache
    │
    ├─ Log execution
    │  │
    │  ├─ timestamp, userId, duration
    │  ├─ status, tool_name, result
    │  │
    │  └─ Update statistics
    │
    └─ Return to caller
       {
         "nitrogen": 120,
         "phosphorus": 60,
         "potassium": 60
       }
```

---

## Module Lifecycle (ML Service)

```
Server starts
    │
    ↓
ModuleRegistry.initialize_all()
    │
    ├─ Module 1: crop-disease-detector
    │  │
    │  ├─ Status: PLANNED
    │  ├─ Check env vars: OPENAI_API_KEY
    │  │  │
    │  │  ├─ Found? → YES
    │  │  │
    │  │  ├─ Check dependencies
    │  │  │  │
    │  │  │  └─ All present? → YES
    │  │  │
    │  │  ├─ Status: LOADING
    │  │  ├─ Load model
    │  │  ├─ Test execution
    │  │  │
    │  │  └─ Status: READY
    │  │
    │  └─ If error → Status: ERROR
    │
    ├─ Module 2: soil-analyzer
    │  │
    │  └─ (same flow)
    │
    ├─ Module 3: yield-predictor
    │  │
    │  └─ (same flow)
    │
    └─ All modules initialized
       │
       ↓
    Module is ready to use
       │
       ├─ First call: Execute, cache result
       │  │
       │  ├─ Start timing
       │  ├─ Call executor
       │  ├─ End timing
       │  ├─ Cache result (TTL: 3600s)
       │  │
       │  └─ Return
       │
       ├─ Second call (within TTL): Return cached
       │  │
       │  ├─ Check cache: HIT
       │  ├─ Return cached result (no execution)
       │  │
       │  └─ Fast response
       │
       ├─ Module statistics tracked
       │  │
       │  ├─ execution_count: 42
       │  ├─ error_count: 1
       │  ├─ avg_duration_ms: 245
       │  │
       │  └─ Performance monitoring
       │
       └─ Server shutdown
          │
          └─ Module cleanup
             ├─ Clear cache
             ├─ Close connections
             │
             └─ Status: DISABLED
```

---

## Session Lifecycle

```
User 1 starts interaction                    User 2 starts interaction
    │                                             │
    ├─ POST /api/command/query                  ├─ POST /api/command/query
    │                                            │
    ├─ No sessionId in request                  ├─ No sessionId in request
    │                                            │
    ├─ SessionManager.createSession()           ├─ SessionManager.createSession()
    │  │                                        │  │
    │  ├─ Generate UUID: "sess-user1"          │  ├─ Generate UUID: "sess-user2"
    │  ├─ Create Session object                 │  ├─ Create Session object
    │  ├─ Save to: data/sessions/sess-user1.json │  ├─ Save to: data/sessions/sess-user2.json
    │  │                                        │  │
    │  └─ Return sessionId                      │  └─ Return sessionId
    │                                            │
    ├─ Process query (Turn 1)                   ├─ Process query (Turn 1)
    │  │                                        │  │
    │  ├─ CommandRegistry.execute(...)          │  ├─ CommandRegistry.execute(...)
    │  ├─ Get result                            │  ├─ Get result
    │  │                                        │  │
    │  └─ SessionManager.addTurn()              │  └─ SessionManager.addTurn()
    │     │                                     │     │
    │     ├─ Load sess-user1.json               │     ├─ Load sess-user2.json
    │     ├─ Add turn 1                         │     ├─ Add turn 1
    │     ├─ Save sess-user1.json               │     ├─ Save sess-user2.json
    │     │                                     │     │
    │     └─ Return updated session             │     └─ Return updated session
    │                                            │
    ├─ Return response with sessionId           ├─ Return response with sessionId
    │                                            │
    ├─ User asks follow-up (Turn 2)             ├─ User asks follow-up (Turn 2)
    │  │                                        │  │
    │  ├─ POST /api/command/query               │  ├─ POST /api/command/query
    │  ├─ Include sessionId in request          │  ├─ Include sessionId in request
    │  │                                        │  │
    │  ├─ SessionManager.getSession(sess-user1) │  ├─ SessionManager.getSession(sess-user2)
    │  │  │                                     │  │  │
    │  │  ├─ Check memory cache → MISS          │  │  ├─ Check memory cache → MISS
    │  │  ├─ Load from disk                     │  │  ├─ Load from disk
    │  │  ├─ Cache in memory                    │  │  ├─ Cache in memory
    │  │  │                                     │  │  │
    │  │  └─ Return session                     │  │  └─ Return session
    │  │                                        │  │
    │  ├─ Process query                         │  ├─ Process query
    │  ├─ Add turn 2                            │  ├─ Add turn 2
    │  │                                        │  │
    │  └─ Save to sess-user1.json               │  └─ Save to sess-user2.json
    │                                            │
    └─ ...continue...                            └─ ...continue...
       │                                            │
       ↓                                            ↓
    Days pass...                               Days pass...
       │                                            │
       ├─ Auto cleanup runs                        ├─ Auto cleanup runs
       │  │                                        │  │
       │  ├─ Check all session files               │  ├─ Check all session files
       │  ├─ If last update > 30 days              │  ├─ If last update > 30 days
       │  ├─ Delete file                           │  ├─ Delete file
       │  │                                        │  │
       │  └─ Log cleanup                           │  └─ Log cleanup
       │                                            │
       └─ Session storage managed                  └─ Session storage managed
```

---

## Statistics Collection Flow

```
System running...

Every command execution:
    │
    ├─ CommandRegistry.execute() → SUCCESS
    │  │
    │  ├─ Log to executionLog
    │  │  {
    │  │    command: "farm-fertilizer",
    │  │    status: "success",
    │  │    duration: 245,
    │  │    userId: "user1",
    │  │    timestamp: "2024-03-20T10:30:15Z"
    │  │  }
    │  │
    │  └─ executionLog size: 1 → 2 → 3 ... (max 10000)

Every query routing:
    │
    ├─ QueryRouter.route() → MATCH FOUND
    │  │
    │  ├─ Log to routingHistory
    │  │  {
    │  │    query: "fertilize rice",
    │  │    matchCount: 2,
    │  │    confidence: 85,
    │  │    timestamp: "2024-03-20T10:30:15Z"
    │  │  }
    │  │
    │  └─ routingHistory size: 1 → 2 → 3 ...

Every tool invocation:
    │
    ├─ ToolPool.invoke() → SUCCESS
    │  │
    │  ├─ Log to invocationLog
    │  │  {
    │  │    tool: "nutrient-calculator",
    │  │    status: "success",
    │  │    duration: 123,
    │  │    userId: "user1",
    │  │    timestamp: "2024-03-20T10:30:15Z"
    │  │  }
    │  │
    │  └─ invocationLog size: 1 → 2 → 3 ...

Frontend requests statistics
    │
    ├─ GET /api/command/stats
    │  │
    │  ├─ CommandRegistry.getStats()
    │  ├─ ToolPool.getStats()
    │  ├─ QueryRouter.getRoutingStats()
    │  ├─ SessionManager.getSessionStats()
    │  │
    │  └─ Aggregate results
    │
    ├─ Return comprehensive statistics
    │  {
    │    commands: {
    │      totalExecutions: 1842,
    │      successCount: 1803,
    │      errorCount: 39,
    │      avgDuration: 243,
    │      byCommand: {...}
    │    },
    │    tools: {
    │      totalInvocations: 2145,
    │      ...
    │    },
    │    routing: {
    │      totalQueries: 856,
    │      avgConfidence: 82,
    │      queriesWithMatches: 843
    │    },
    │    sessions: {
    │      totalSessions: 127,
    │      activeSessions: 43,
    │      totalTurns: 2341
    │    }
    │  }
    │
    └─ Frontend displays dashboard
```

---

## Error Handling Flow

```
User makes request with errors

Case 1: Command not found
    │
    ├─ QueryRouter.route("xyz") 
    │  │
    │  ├─ No CommandRegistry match
    │  ├─ No ToolPool match
    │  │
    │  └─ QueryRoute { matchedCommands: [], matchedTools: [], confidence: 0 }
    │
    ├─ QueryRouter.processQuery()
    │  │
    │  ├─ No matches found
    │  ├─ Get suggestions via getSuggestions()
    │  │
    │  ├─ Return TurnResult
    │  │  {
    │  │    output: "No exact match found for 'xyz'\n\nDid you mean...",
    │  │    stopReason: "no_match_with_suggestions"
    │  │  }
    │  │
    │  └─ frontend gets suggestions: "farm-status", "farm-info", etc.

Case 2: Permission denied
    │
    ├─ CommandRegistry.execute("admin-command")
    │  │
    │  ├─ User permissions: ["read:farm"]
    │  ├─ Command requires: ["admin:*"]
    │  │
    │  ├─ Permission check: FAIL
    │  │
    │  ├─ Throw PermissionError
    │  ├─ Log execution with status: "error"
    │  │
    │  └─ Return TurnResult
    │     {
    │       output: "Permission denied for command: admin-command",
    │       stopReason: "permission_denied"
    │     }

Case 3: Rate limit exceeded
    │
    ├─ ToolPool.invoke("nutrient-calculator")
    │  │
    │  ├─ Get rate limit: 60 calls/min
    │  ├─ Get user calls: 60 (already at limit)
    │  │
    │  ├─ checkRateLimit() → FAIL
    │  │
    │  ├─ Throw RateLimitError
    │  │
    │  └─ Return HTTP 429 Too Many Requests

Case 4: Execution error
    │
    ├─ CommandRegistry.execute("farm-fertilizer")
    │  │
    │  ├─ Handler throws error
    │  │
    │  ├─ Catch error
    │  ├─ Log to executionLog with status: "error"
    │  ├─ LogExecution() records error
    │  │
    │  ├─ Update stats: errorCount++
    │  │
    │  └─ Throw error to caller

All errors logged and tracked
    │
    └─ Available in stats dashboard
```

---

These diagrams provide visual understanding of the architecture and data flows.
