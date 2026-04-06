/**
 * AgriTech Command Router
 * Integrates CommandRegistry, ToolPool, and QueryRouter
 * Provides unified endpoint for farmer queries
 */

const express = require('express');
const { SessionManager } = require('../core/SessionManager');
const CommandRegistry = require('../core/CommandRegistry');
const ToolPool = require('../core/ToolPool');
const QueryRouter = require('../core/QueryRouter');
const { ExecutionContext } = require('../core/types');
const auth = require('../middleware/auth');

const router = express.Router();

// Initialize components (would be singleton in real app)
const sessionManager = new SessionManager('./data/sessions');
const commandRegistry = new CommandRegistry();
const toolPool = new ToolPool({ simpleMode: false, includeExperimental: false });
const queryRouter = new QueryRouter(commandRegistry, toolPool);

// Middleware to setup execution context
router.use(auth);
const setupContext = (req, res, next) => {
  req.executionContext = new ExecutionContext(
    req.userId,
    req.body.farmId || null,
    req.body.sessionId || null
  );
  next();
};
router.use(setupContext);

/**
 * POST /api/command/query
 * Route a farmer's natural language query
 */
router.post('/query', async (req, res) => {
  try {
    const { query, sessionId, farmId, maxAttempts = 1 } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Get or create session
    let session = sessionId ? await sessionManager.getSession(sessionId) : null;
    if (!session) {
      session = await sessionManager.createSession(req.userId, farmId);
    }

    // Process the query
    const result = await queryRouter.processQuery(query, req.executionContext, {}, {
      maxAttempts,
      matchLimit: 5
    });

    // Add turn to session
    await sessionManager.addTurn(session.sessionId, query, result.toJSON ? result.toJSON() : result);

    // Respond
    res.json({
      success: true,
      sessionId: session.sessionId,
      turnNumber: session.turns.length,
      result: result.toJSON ? result.toJSON() : result
    });
  } catch (error) {
    console.error('Query processing error:', error);
    res.status(500).json({
      error: error.message,
      executionContext: req.executionContext.toJSON()
    });
  }
});

/**
 * GET /api/command/route/:query
 * Get routing information for a query without executing
 */
router.get('/route/:query', (req, res) => {
  try {
    const query = decodeURIComponent(req.params.query);
    const route = queryRouter.route(query, 5);

    res.json({
      success: true,
      query,
      confidence: route.confidence,
      matchedCommands: route.matchedCommands.map(m => ({
        name: m.command.name,
        description: m.command.description,
        scope: m.command.scope,
        score: m.score
      })),
      matchedTools: route.matchedTools.map(t => ({
        name: t.tool.name,
        description: t.tool.description,
        category: t.tool.category,
        score: t.score
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/command/sessions/:sessionId
 * Get session details
 */
router.get('/sessions/:sessionId', async (req, res) => {
  try {
    const session = await sessionManager.getSession(req.params.sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      session: session.toJSON()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/command/user/sessions
 * Get all sessions for user
 */
router.get('/user/sessions', async (req, res) => {
  try {
    const sessions = await sessionManager.getUserSessions(req.userId, 50, true);

    res.json({
      success: true,
      count: sessions.length,
      sessions: sessions.map(s => ({
        sessionId: s.sessionId,
        farmId: s.farmId,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        turnCount: s.turns.length,
        isActive: s.isActive
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/command/sessions/:sessionId/close
 * Close a session
 */
router.post('/sessions/:sessionId/close', async (req, res) => {
  try {
    const session = await sessionManager.getSession(req.params.sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await sessionManager.closeSession(req.params.sessionId);

    res.json({
      success: true,
      message: 'Session closed'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/command/registry
 * Get command registry (admin only)
 */
router.get('/registry', (req, res) => {
  try {
    const commands = commandRegistry.getAll();
    const markdown = commandRegistry.renderMarkdown();

    res.json({
      success: true,
      commandCount: commands.length,
      commands: commands.map(c => ({
        name: c.name,
        description: c.description,
        scope: c.scope
      })),
      markdown
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/command/tools
 * Get tool pool
 */
router.get('/tools', (req, res) => {
  try {
    const tools = toolPool.getAll();
    const markdown = toolPool.renderMarkdown();

    res.json({
      success: true,
      toolCount: tools.length,
      tools: tools.map(t => ({
        name: t.name,
        description: t.description,
        category: t.category,
        enabled: t.enabled
      })),
      markdown
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/command/stats
 * Get router statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const routingStats = queryRouter.getRoutingStats();
    const commandStats = commandRegistry.getStats();
    const toolStats = toolPool.getStats();
    const sessionStats = await sessionManager.getSessionStats(req.userId);

    res.json({
      success: true,
      routing: routingStats,
      commands: commandStats,
      tools: toolStats,
      sessions: sessionStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/command/health
 * Health check
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    commandRegistryReady: commandRegistry.getAll().length > 0,
    toolPoolReady: toolPool.getAll().length > 0,
    queryRouterReady: true,
    timestamp: new Date()
  });
});

module.exports = router;
