/**
 * Core type definitions for AgriTech AI
 * Following Claw Code architecture patterns for robustness
 */

/**
 * Command Registry Entry
 * Represents a farmer command or workflow
 */
class CommandEntry {
  constructor(name, handler, description, scope = 'farm', permissions = []) {
    this.name = name;
    this.handler = handler;
    this.description = description;
    this.scope = scope; // 'farm', 'soil', 'weather', 'market'
    this.permissions = permissions;
    this.createdAt = new Date();
  }

  async execute(context, params) {
    if (!context.user.permissions.includes('*') && !context.user.permissions.includes(this.name)) {
      throw new Error(`Permission denied for command: ${this.name}`);
    }
    return this.handler(context, params);
  }
}

/**
 * Tool Entry
 * Represents an available tool/capability
 */
class ToolEntry {
  constructor(name, executor, schema, description, category = 'analysis') {
    this.name = name;
    this.executor = executor;
    this.schema = schema; // Input validation schema
    this.description = description;
    this.category = category; // 'analysis', 'prediction', 'recommendation', 'monitoring'
    this.enabled = true;
    this.rateLimitPerMinute = 60;
  }

  async invoke(context, input) {
    // Validate input against schema
    if (!this.validateInput(input)) {
      throw new Error(`Invalid input for tool: ${this.name}`);
    }
    return this.executor(context, input);
  }

  validateInput(input) {
    // Schema validation logic
    if (!this.schema) return true;
    return Object.keys(this.schema).every(key => 
      !this.schema[key].required || input.hasOwnProperty(key)
    );
  }
}

/**
 * Query Route
 * Represents matched commands/tools for a query
 */
class QueryRoute {
  constructor(query, matchedCommands = [], matchedTools = [], confidence = 0) {
    this.query = query;
    this.matchedCommands = matchedCommands;
    this.matchedTools = matchedTools;
    this.confidence = confidence;
    this.timestamp = new Date();
  }

  addCommand(command, score) {
    this.matchedCommands.push({ command, score });
  }

  addTool(tool, score) {
    this.matchedTools.push({ tool, score });
  }

  get bestMatch() {
    const commands = this.matchedCommands.sort((a, b) => b.score - a.score);
    const tools = this.matchedTools.sort((a, b) => b.score - a.score);
    return {
      command: commands[0],
      tool: tools[0]
    };
  }
}

/**
 * Execution Context
 * Rich context like Claw Code for command/tool execution
 */
class ExecutionContext {
  constructor(userId, farmId, sessionId) {
    this.userId = userId;
    this.farmId = farmId;
    this.sessionId = sessionId;
    this.timestamp = new Date();
    this.metadata = {};
    this.executionHistory = [];
    this.errors = [];
  }

  recordExecution(commandName, result, duration) {
    this.executionHistory.push({
      command: commandName,
      result,
      duration,
      timestamp: new Date()
    });
  }

  recordError(error) {
    this.errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date()
    });
  }

  toJSON() {
    return {
      userId: this.userId,
      farmId: this.farmId,
      sessionId: this.sessionId,
      timestamp: this.timestamp,
      metadata: this.metadata,
      executionCount: this.executionHistory.length,
      errorCount: this.errors.length,
      executionHistory: this.executionHistory.slice(-10),
      recentErrors: this.errors.slice(-5)
    };
  }
}

/**
 * Turn Result
 * Represents the result of processing one user turn
 */
class TurnResult {
  constructor(prompt, output, matchedRoute) {
    this.prompt = prompt;
    this.output = output;
    this.matchedRoute = matchedRoute;
    this.executedCommands = [];
    this.executedTools = [];
    this.permissionDenials = [];
    this.usage = {
      inputTokens: Math.ceil(prompt.split(/\s+/).length),
      outputTokens: Math.ceil(output.split(/\s+/).length),
      timestamp: new Date()
    };
    this.stopReason = 'success';
  }

  addCommandExecution(name, result) {
    this.executedCommands.push({ name, result, timestamp: new Date() });
  }

  addToolExecution(name, result) {
    this.executedTools.push({ name, result, timestamp: new Date() });
  }

  addPermissionDenial(toolName, reason) {
    this.permissionDenials.push({ toolName, reason, timestamp: new Date() });
  }

  toJSON() {
    return {
      prompt: this.prompt,
      output: this.output,
      matchedRoute: this.matchedRoute,
      executedCommands: this.executedCommands,
      executedTools: this.executedTools,
      permissionDenials: this.permissionDenials,
      usage: this.usage,
      stopReason: this.stopReason
    };
  }
}

module.exports = {
  CommandEntry,
  ToolEntry,
  QueryRoute,
  ExecutionContext,
  TurnResult
};
