/**
 * Core Module Exports
 * Central export point for all Claw Code-inspired architecture components
 */

const CommandRegistry = require('./CommandRegistry');
const ToolPool = require('./ToolPool');
const QueryRouter = require('./QueryRouter');
const { SessionManager, Session } = require('./SessionManager');
const {
  CommandEntry,
  ToolEntry,
  QueryRoute,
  ExecutionContext,
  TurnResult
} = require('./types');

module.exports = {
  // Registries & Managers
  CommandRegistry,
  ToolPool,
  QueryRouter,
  SessionManager,
  Session,

  // Type Classes
  CommandEntry,
  ToolEntry,
  QueryRoute,
  ExecutionContext,
  TurnResult,

  // Utility: Create full system
  createAgriTechSystem: () => ({
    commandRegistry: new CommandRegistry(),
    toolPool: new ToolPool(),
    sessionManager: new SessionManager('./data/sessions'),
    queryRouter: null // Set after command registry and tool pool
  })
};
