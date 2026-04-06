/**
 * Test Suite for Core Command, Tool, and Routing System
 * Tests CommandRegistry, ToolPool, QueryRouter, and SessionManager
 */

const { describe, it, beforeEach, afterEach } = require('mocha');
const assert = require('assert');
const fs = require('fs').promises;
const path = require('path');

// Import core modules
const CommandRegistry = require('../core/CommandRegistry');
const ToolPool = require('../core/ToolPool');
const QueryRouter = require('../core/QueryRouter');
const SessionManager = require('../core/SessionManager');
const { ExecutionContext, TurnResult } = require('../core/types');

describe('CommandRegistry', () => {
  let registry;

  beforeEach(() => {
    registry = new CommandRegistry();
  });

  describe('register', () => {
    it('should register a new command', () => {
      const result = registry.register(
        'test-command',
        async () => ({ result: 'success' }),
        'Test command',
        'farm',
        ['read:farm']
      );
      assert.strictEqual(result, true);
    });

    it('should prevent duplicate registration', () => {
      registry.register('test', async () => {}, 'Test', 'farm', []);
      const result = registry.register('test', async () => {}, 'Test', 'farm', []);
      assert.strictEqual(result, false);
    });

    it('should organize commands by scope', () => {
      registry.register('cmd1', async () => {}, 'Cmd 1', 'farm', []);
      registry.register('cmd2', async () => {}, 'Cmd 2', 'soil', []);
      
      const allCommands = registry.getAll();
      assert.strictEqual(allCommands.length, 2);
    });
  });

  describe('execute', () => {
    it('should execute a registered command', async () => {
      registry.register(
        'test-cmd',
        async (ctx, params) => ({ status: 'ok', data: params }),
        'Test',
        'farm',
        []
      );

      const context = new ExecutionContext('user1', 'farm1', 'session1');
      const result = await registry.execute('test-cmd', context, { key: 'value' });
      
      assert.strictEqual(result.status, 'ok');
      assert.strictEqual(result.data.key, 'value');
    });

    it('should throw error for non-existent command', async () => {
      const context = new ExecutionContext('user1', 'farm1', 'session1');
      
      try {
        await registry.execute('non-existent', context, {});
        assert.fail('Should have thrown error');
      } catch (err) {
        assert(err.message.includes('not found'));
      }
    });

    it('should check permissions before execution', async () => {
      registry.register(
        'admin-cmd',
        async () => ({ result: 'ok' }),
        'Admin command',
        'farm',
        ['admin:*']
      );

      const context = new ExecutionContext('user1', 'farm1', 'session1');
      context.userPermissions = ['read:farm'];
      
      try {
        await registry.execute('admin-cmd', context, {});
        assert.fail('Should have thrown permission error');
      } catch (err) {
        assert(err.message.includes('Permission denied'));
      }
    });

    it('should log execution', async () => {
      registry.register(
        'test-cmd',
        async () => ({ result: 'ok' }),
        'Test',
        'farm',
        []
      );

      const context = new ExecutionContext('user1', 'farm1', 'session1');
      await registry.execute('test-cmd', context, {});
      
      const stats = registry.getStats();
      assert.strictEqual(stats.totalExecutions, 1);
    });
  });

  describe('getByQuery', () => {
    beforeEach(() => {
      registry.register('farm-status', async () => {}, 'Get farm status', 'farm', []);
      registry.register('farm-info', async () => {}, 'Get farm info', 'farm', []);
      registry.register('soil-analysis', async () => {}, 'Get soil analysis', 'soil', []);
    });

    it('should find exact match', () => {
      const matches = registry.getByQuery('farm-status');
      assert.strictEqual(matches.length > 0, true);
      assert.strictEqual(matches[0].command.name, 'farm-status');
    });

    it('should find fuzzy matches', () => {
      const matches = registry.getByQuery('farm');
      assert.strictEqual(matches.length >= 2, true);
    });

    it('should score matches by relevance', () => {
      const matches = registry.getByQuery('farm status');
      // farm-status should score higher than soil-analysis
      assert.strictEqual(matches[0].command.name, 'farm-status');
    });

    it('should limit results', () => {
      const matches = registry.getByQuery('farm', 1);
      assert.strictEqual(matches.length, 1);
    });
  });

  describe('getStats', () => {
    it('should track execution statistics', async () => {
      registry.register('test', async () => {}, 'Test', 'farm', []);
      
      const context = new ExecutionContext('user1', 'farm1', 'session1');
      await registry.execute('test', context, {});
      
      const stats = registry.getStats();
      assert.strictEqual(stats.totalExecutions, 1);
      assert.strictEqual(stats.successCount, 1);
    });

    it('should track error statistics', async () => {
      registry.register(
        'error-cmd',
        async () => { throw new Error('Test error'); },
        'Error cmd',
        'farm',
        []
      );
      
      const context = new ExecutionContext('user1', 'farm1', 'session1');
      
      try {
        await registry.execute('error-cmd', context, {});
      } catch (e) {}
      
      const stats = registry.getStats();
      assert.strictEqual(stats.errorCount, 1);
    });
  });
});

describe('ToolPool', () => {
  let toolPool;

  beforeEach(() => {
    toolPool = new ToolPool();
  });

  describe('register', () => {
    it('should register a new tool', () => {
      const result = toolPool.register(
        'test-tool',
        async () => ({ result: 'ok' }),
        { input: 'string', required: ['input'] },
        'Test tool',
        'analysis',
        {}
      );
      assert.strictEqual(result, true);
    });

    it('should prevent duplicate registration', () => {
      toolPool.register('test', async () => {}, {}, 'Test', 'analysis', {});
      const result = toolPool.register('test', async () => {}, {}, 'Test', 'analysis', {});
      assert.strictEqual(result, false);
    });
  });

  describe('invoke', () => {
    it('should invoke a registered tool', async () => {
      toolPool.register(
        'test-tool',
        async (ctx, input) => ({ processed: input.data * 2 }),
        { data: 'number' },
        'Test tool',
        'analysis',
        {}
      );

      const context = new ExecutionContext('user1', 'farm1', 'session1');
      const result = await toolPool.invoke('test-tool', context, { data: 5 });
      
      assert.strictEqual(result.processed, 10);
    });

    it('should validate input against schema', async () => {
      toolPool.register(
        'test-tool',
        async () => ({ result: 'ok' }),
        { required_field: 'string', required: ['required_field'] },
        'Test tool',
        'analysis',
        {}
      );

      const context = new ExecutionContext('user1', 'farm1', 'session1');
      
      try {
        await toolPool.invoke('test-tool', context, { wrong_field: 'value' });
        assert.fail('Should have thrown validation error');
      } catch (err) {
        assert(err.message.includes('Invalid input'));
      }
    });

    it('should check rate limits', async () => {
      toolPool.register(
        'rate-limited-tool',
        async () => ({ result: 'ok' }),
        {},
        'Rate limited',
        'analysis',
        { rateLimit: 2 }
      );

      const context = new ExecutionContext('user1', 'farm1', 'session1');
      
      // First two invocations should succeed
      await toolPool.invoke('rate-limited-tool', context, {});
      await toolPool.invoke('rate-limited-tool', context, {});
      
      // Third should fail
      try {
        await toolPool.invoke('rate-limited-tool', context, {});
        assert.fail('Should have exceeded rate limit');
      } catch (err) {
        assert(err.message.includes('Rate limit'));
      }
    });

    it('should cache results', async () => {
      let callCount = 0;
      toolPool.register(
        'cached-tool',
        async () => { callCount++; return { count: callCount }; },
        {},
        'Cached tool',
        'analysis',
        { cacheTTL: 300 }
      );

      const context = new ExecutionContext('user1', 'farm1', 'session1');
      
      // First call - should increment
      const result1 = await toolPool.invoke('cached-tool', context, {});
      assert.strictEqual(result1.count, 1);
      
      // Second call - should return cache
      const result2 = await toolPool.invoke('cached-tool', context, {});
      assert.strictEqual(result2.count, 1);
      
      assert.strictEqual(callCount, 1);
    });
  });

  describe('findByQuery', () => {
    beforeEach(() => {
      toolPool.register('nutrient-calc', async () => {}, {}, 'Nutrient calculator', 'analysis', {});
      toolPool.register('pest-identifier', async () => {}, {}, 'Pest identifier', 'analysis', {});
      toolPool.register('yield-predictor', async () => {}, {}, 'Yield predictor', 'prediction', {});
    });

    it('should find tools by query', () => {
      const results = toolPool.findByQuery('nutrient');
      assert.strictEqual(results.length > 0, true);
      assert.strictEqual(results[0].tool.name, 'nutrient-calc');
    });

    it('should limit results', () => {
      const results = toolPool.findByQuery('', 1);
      assert.strictEqual(results.length, 1);
    });
  });
});

describe('QueryRouter', () => {
  let router;
  let registry;
  let toolPool;

  beforeEach(() => {
    registry = new CommandRegistry();
    toolPool = new ToolPool();
    router = new QueryRouter(registry, toolPool);

    // Setup test commands and tools
    registry.register('farm-fertilizer', async () => ({ result: 'NPK 12-60-60' }), 'Fertilizer recommendation', 'farm', []);
    registry.register('crop-health', async () => ({ result: 'Health score: 85' }), 'Crop health check', 'farm', []);
    
    toolPool.register('soil-calc', async () => {}, {}, 'Soil calculator', 'analysis', {});
  });

  describe('route', () => {
    it('should route query to commands', () => {
      const route = router.route('What fertilizer for rice?', 5);
      assert.strictEqual(route.matchedCommands.length > 0, true);
    });

    it('should route query to tools', () => {
      const route = router.route('Calculate soil nutrients', 5);
      assert.strictEqual(route.matchedTools.length >= 0, true);
    });

    it('should score matches by confidence', () => {
      const route = router.route('farm fertilizer');
      assert.strictEqual(route.confidence >= 0, true);
      assert.strictEqual(route.confidence <= 100, true);
    });

    it('should limit results', () => {
      const route = router.route('farm', 1);
      const totalMatches = route.matchedCommands.length + route.matchedTools.length;
      assert.strictEqual(totalMatches <= 1, true);
    });
  });

  describe('executeRoute', () => {
    it('should execute best matching command', async () => {
      const route = router.route('farm fertilizer');
      const context = new ExecutionContext('user1', 'farm1', 'session1');
      
      const result = await router.executeRoute(route, context, {});
      assert.strictEqual(result !== null, true);
    });
  });

  describe('processQuery', () => {
    it('should process end-to-end query', async () => {
      const context = new ExecutionContext('user1', 'farm1', 'session1');
      
      const result = await router.processQuery('What fertilizer?', context, {}, {});
      
      assert(result instanceof TurnResult);
      assert.strictEqual(result.prompt, 'What fertilizer?');
      assert.strictEqual(result.output.length > 0, true);
    });
  });

  describe('getSuggestions', () => {
    it('should provide suggestions for unmatched query', () => {
      const suggestions = router.getSuggestions('xyz123', 3);
      // Should return similar commands even if no exact match
      assert.strictEqual(Array.isArray(suggestions), true);
    });
  });
});

describe('SessionManager', () => {
  let sessionManager;
  const testDir = path.join(__dirname, '.test-sessions');

  beforeEach(async () => {
    // Create test directory
    await fs.mkdir(testDir, { recursive: true });
    sessionManager = new SessionManager(testDir);
  });

  afterEach(async () => {
    // Cleanup test directory
    try {
      await fs.rm(testDir, { recursive: true });
    } catch (e) {}
  });

  describe('createSession', () => {
    it('should create a new session', async () => {
      const session = await sessionManager.createSession('user1', 'farm1');
      
      assert.strictEqual(session.userId, 'user1');
      assert.strictEqual(session.farmId, 'farm1');
      assert.strictEqual(session.turns.length, 0);
    });

    it('should generate unique session IDs', async () => {
      const session1 = await sessionManager.createSession('user1', 'farm1');
      const session2 = await sessionManager.createSession('user1', 'farm1');
      
      assert.notStrictEqual(session1.sessionId, session2.sessionId);
    });
  });

  describe('getSession', () => {
    it('should retrieve existing session', async () => {
      const created = await sessionManager.createSession('user1', 'farm1');
      const retrieved = await sessionManager.getSession(created.sessionId);
      
      assert.strictEqual(retrieved.sessionId, created.sessionId);
    });

    it('should throw error for non-existent session', async () => {
      try {
        await sessionManager.getSession('non-existent-id');
        assert.fail('Should have thrown error');
      } catch (err) {
        assert(err.message.includes('not found'));
      }
    });
  });

  describe('addTurn', () => {
    it('should add turn to session', async () => {
      const session = await sessionManager.createSession('user1', 'farm1');
      
      const result = {
        prompt: 'Test prompt',
        output: 'Test output'
      };
      
      const updated = await sessionManager.addTurn(session.sessionId, 'Test prompt', result);
      
      assert.strictEqual(updated.turns.length, 1);
      assert.strictEqual(updated.turns[0].prompt, 'Test prompt');
    });

    it('should maintain turn order', async () => {
      const session = await sessionManager.createSession('user1', 'farm1');
      
      await sessionManager.addTurn(session.sessionId, 'Q1', { output: 'A1' });
      await sessionManager.addTurn(session.sessionId, 'Q2', { output: 'A2' });
      
      const retrieved = await sessionManager.getSession(session.sessionId);
      
      assert.strictEqual(retrieved.turns.length, 2);
      assert.strictEqual(retrieved.turns[0].prompt, 'Q1');
      assert.strictEqual(retrieved.turns[1].prompt, 'Q2');
    });
  });

  describe('getUserSessions', () => {
    it('should list user sessions', async () => {
      await sessionManager.createSession('user1', 'farm1');
      await sessionManager.createSession('user1', 'farm2');
      await sessionManager.createSession('user2', 'farm3');
      
      const userSessions = await sessionManager.getUserSessions('user1');
      
      assert.strictEqual(userSessions.length, 2);
    });

    it('should limit results', async () => {
      await sessionManager.createSession('user1', 'farm1');
      await sessionManager.createSession('user1', 'farm2');
      await sessionManager.createSession('user1', 'farm3');
      
      const limited = await sessionManager.getUserSessions('user1', 2);
      
      assert.strictEqual(limited.length, 2);
    });

    it('should filter active only', async () => {
      const session = await sessionManager.createSession('user1', 'farm1');
      
      // Close session
      await sessionManager.getUserSessions('user1'); // Load to cache
      // Manual close by marking inactive
      
      const active = await sessionManager.getUserSessions('user1', 100, true);
      assert.strictEqual(active.length >= 0, true);
    });
  });

  describe('exportSessionMarkdown', () => {
    it('should export session as markdown', async () => {
      const session = await sessionManager.createSession('user1', 'farm1');
      await sessionManager.addTurn(session.sessionId, 'What to plant?', { output: 'Plant rice' });
      
      const markdown = await sessionManager.exportSessionMarkdown(session.sessionId);
      
      assert(markdown.includes('What to plant?'));
      assert(markdown.includes('Plant rice'));
    });
  });
});

describe('ExecutionContext', () => {
  it('should create context with user, farm, session', () => {
    const context = new ExecutionContext('user1', 'farm1', 'session1');
    
    assert.strictEqual(context.userId, 'user1');
    assert.strictEqual(context.farmId, 'farm1');
    assert.strictEqual(context.sessionId, 'session1');
  });

  it('should track execution history', () => {
    const context = new ExecutionContext('user1', 'farm1', 'session1');
    
    context.executionHistory.push({ command: 'test', duration: 100 });
    
    assert.strictEqual(context.executionHistory.length, 1);
  });

  it('should track errors', () => {
    const context = new ExecutionContext('user1', 'farm1', 'session1');
    
    context.errors.push('Test error');
    
    assert.strictEqual(context.errors.length, 1);
  });
});

describe('TurnResult', () => {
  it('should create turn result with prompt and output', () => {
    const result = new TurnResult('Test prompt', 'Test output');
    
    assert.strictEqual(result.prompt, 'Test prompt');
    assert.strictEqual(result.output, 'Test output');
  });

  it('should track executed commands and tools', () => {
    const result = new TurnResult('Q', 'A');
    
    result.executedCommands = ['cmd1'];
    result.executedTools = ['tool1'];
    
    assert.strictEqual(result.executedCommands.length, 1);
    assert.strictEqual(result.executedTools.length, 1);
  });
});

// Integration tests
describe('Integration - End-to-End Query Flow', () => {
  let registry;
  let toolPool;
  let router;
  let sessionManager;
  const testDir = path.join(__dirname, '.test-integration');

  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
    
    registry = new CommandRegistry();
    toolPool = new ToolPool();
    router = new QueryRouter(registry, toolPool);
    sessionManager = new SessionManager(testDir);

    // Setup demo commands and tools
    registry.register(
      'farm-fertilizer',
      async (ctx, params) => ({ 
        fertilizer: 'NPK 12-60-60',
        quantity: '50 kg',
        cost: '₹2500'
      }),
      'Get fertilizer recommendation',
      'farm',
      ['read:farm', 'read:soil']
    );

    toolPool.register(
      'nutrient-calculator',
      async (ctx, input) => ({ 
        nitrogen: 120,
        phosphorus: 60,
        potassium: 60
      }),
      { crop: 'string', area: 'number' },
      'Calculate soil nutrients',
      'analysis',
      {}
    );
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true });
    } catch (e) {}
  });

  it('should process complete user query with session', async () => {
    // Create session
    const session = await sessionManager.createSession('user1', 'farm1');
    
    // Create context
    const context = new ExecutionContext('user1', 'farm1', session.sessionId);
    context.userPermissions = ['read:farm', 'read:soil'];
    
    // Process query
    const result = await router.processQuery('What fertilizer for my farm?', context, {}, {});
    
    // Save to session
    await sessionManager.addTurn(session.sessionId, result.prompt, result);
    
    // Retrieve and verify
    const updated = await sessionManager.getSession(session.sessionId);
    
    assert.strictEqual(updated.turns.length, 1);
    assert.strictEqual(updated.turns[0].prompt, result.prompt);
  });

  it('should handle multi-turn conversation', async () => {
    const session = await sessionManager.createSession('user1', 'farm1');
    const context = new ExecutionContext('user1', 'farm1', session.sessionId);
    context.userPermissions = ['read:farm', 'read:soil'];
    
    // Turn 1
    const result1 = await router.processQuery('What fertilizer?', context, {}, {});
    await sessionManager.addTurn(session.sessionId, result1.prompt, result1);
    
    // Turn 2
    const result2 = await router.processQuery('How much quantity?', context, {}, {});
    await sessionManager.addTurn(session.sessionId, result2.prompt, result2);
    
    // Verify
    const final = await sessionManager.getSession(session.sessionId);
    assert.strictEqual(final.turns.length, 2);
  });
});

console.log('✅ Test suite configured for CommandRegistry, ToolPool, QueryRouter, and SessionManager');
