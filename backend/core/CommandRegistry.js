/**
 * CommandRegistry - Central registry for all farmer commands
 * Inspired by Claw Code's command graph architecture
 */

const { CommandEntry } = require('./types');

class CommandRegistry {
  constructor() {
    this.commands = new Map();
    this.commandsByScope = new Map();
    this.executionLog = [];
    this.maxLogSize = 10000;
  }

  /**
   * Register a command handler
   */
  register(name, handler, description, scope = 'general', permissions = []) {
    if (this.commands.has(name)) {
      throw new Error(`Command already registered: ${name}`);
    }

    const command = new CommandEntry(name, handler, description, scope, permissions);
    this.commands.set(name, command);

    // Index by scope
    if (!this.commandsByScope.has(scope)) {
      this.commandsByScope.set(scope, []);
    }
    this.commandsByScope.get(scope).push(command);

    return command;
  }

  /**
   * Get command by name
   */
  get(name) {
    return this.commands.get(name);
  }

  /**
   * Get all commands
   */
  getAll(scope = null) {
    if (scope) {
      return this.commandsByScope.get(scope) || [];
    }
    return Array.from(this.commands.values());
  }

  /**
   * Get command by fuzzy matching
   */
  getByQuery(query) {
    const q = query.toLowerCase();
    const matches = [];

    for (const cmd of this.commands.values()) {
      let score = 0;
      
      // Exact match
      if (cmd.name === q) score = 100;
      // Prefix match
      else if (cmd.name.startsWith(q)) score = 80;
      // Contains match
      else if (cmd.name.includes(q)) score = 60;
      // Description match
      else if (cmd.description.toLowerCase().includes(q)) score = 40;

      if (score > 0) {
        matches.push({ command: cmd, score });
      }
    }

    return matches.sort((a, b) => b.score - a.score);
  }

  /**
   * Execute a command
   */
  async execute(commandName, context, params = {}) {
    const command = this.get(commandName);
    if (!command) {
      throw new Error(`Command not found: ${commandName}`);
    }

    const startTime = Date.now();
    try {
      const result = await command.execute(context, params);
      const duration = Date.now() - startTime;

      this.logExecution({
        commandName,
        status: 'success',
        duration,
        userId: context.userId,
        params: this.sanitizeParams(params),
        timestamp: new Date()
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logExecution({
        commandName,
        status: 'error',
        error: error.message,
        duration,
        userId: context.userId,
        timestamp: new Date()
      });

      throw error;
    }
  }

  /**
   * Log command execution
   */
  logExecution(log) {
    this.executionLog.push(log);
    if (this.executionLog.length > this.maxLogSize) {
      this.executionLog.shift();
    }
  }

  /**
   * Get execution logs
   */
  getExecutionLog(userId = null, limit = 100) {
    let logs = this.executionLog;
    if (userId) {
      logs = logs.filter(l => l.userId === userId);
    }
    return logs.slice(-limit).reverse();
  }

  /**
   * Get command stats
   */
  getStats(timeWindowMs = 86400000) {
    const cutoff = Date.now() - timeWindowMs;
    const logs = this.executionLog.filter(l => new Date(l.timestamp) > cutoff);

    const stats = {
      totalExecutions: logs.length,
      successCount: logs.filter(l => l.status === 'success').length,
      errorCount: logs.filter(l => l.status === 'error').length,
      avgDuration: logs.length > 0 ? logs.reduce((s, l) => s + l.duration, 0) / logs.length : 0,
      byCommand: {},
      topErrors: []
    };

    // Stats by command
    logs.forEach(log => {
      if (!stats.byCommand[log.commandName]) {
        stats.byCommand[log.commandName] = { count: 0, errors: 0 };
      }
      stats.byCommand[log.commandName].count++;
      if (log.status === 'error') {
        stats.byCommand[log.commandName].errors++;
      }
    });

    // Top errors
    const errorMap = new Map();
    logs.forEach(log => {
      if (log.error) {
        errorMap.set(log.error, (errorMap.get(log.error) || 0) + 1);
      }
    });
    stats.topErrors = Array.from(errorMap)
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return stats;
  }

  /**
   * Render registry as markdown
   */
  renderMarkdown() {
    const lines = ['# Command Registry', ''];

    for (const [scope, commands] of this.commandsByScope) {
      lines.push(`## ${scope.charAt(0).toUpperCase() + scope.slice(1)}`);
      lines.push('');
      for (const cmd of commands) {
        lines.push(`- **${cmd.name}** — ${cmd.description}`);
        if (cmd.permissions.length > 0) {
          lines.push(`  - Permissions: ${cmd.permissions.join(', ')}`);
        }
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Sanitize parameters for logging
   */
  sanitizeParams(params) {
    const sensitive = ['password', 'token', 'apiKey', 'secret'];
    const sanitized = { ...params };
    for (const key in sanitized) {
      if (sensitive.some(s => key.toLowerCase().includes(s))) {
        sanitized[key] = '***';
      }
    }
    return sanitized;
  }
}

module.exports = CommandRegistry;
