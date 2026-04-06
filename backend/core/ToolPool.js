/**
 * ToolPool - Centralized tool/capability management
 * Inspired by Claw Code's tool pool architecture
 */

const { ToolEntry } = require('./types');

class ToolPool {
  constructor(options = {}) {
    this.tools = new Map();
    this.toolsByCategory = new Map();
    this.permissionContext = options.permissionContext || {};
    this.simpleMode = options.simpleMode || false;
    this.includeExperimental = options.includeExperimental || false;
    this.rateLimits = new Map();
    this.invocationLog = [];
    this.maxLogSize = 5000;
  }

  /**
   * Register a tool
   */
  register(name, executor, schema, description, category = 'analysis', options = {}) {
    if (this.tools.has(name)) {
      throw new Error(`Tool already registered: ${name}`);
    }

    const tool = new ToolEntry(name, executor, schema, description, category);
    tool.experimental = options.experimental || false;
    tool.rateLimitPerMinute = options.rateLimitPerMinute || 60;
    tool.requiredPermissions = options.requiredPermissions || [];

    // Skip experimental tools in simple mode
    if (this.simpleMode && tool.experimental) {
      tool.enabled = false;
    }

    this.tools.set(name, tool);

    // Index by category
    if (!this.toolsByCategory.has(category)) {
      this.toolsByCategory.set(category, []);
    }
    this.toolsByCategory.get(category).push(tool);

    // Initialize rate limit tracker
    this.rateLimits.set(name, []);

    return tool;
  }

  /**
   * Get tool by name
   */
  get(name) {
    return this.tools.get(name);
  }

  /**
   * Get all tools
   */
  getAll(category = null, enabledOnly = true) {
    let tools = Array.from(this.tools.values());
    
    if (category) {
      tools = tools.filter(t => t.category === category);
    }
    
    if (enabledOnly) {
      tools = tools.filter(t => t.enabled);
    }
    
    return tools;
  }

  /**
   * Find tools by query
   */
  findByQuery(query, limit = 5) {
    const q = query.toLowerCase();
    const matches = [];

    for (const tool of this.tools.values()) {
      if (!tool.enabled) continue;

      let score = 0;

      // Exact match
      if (tool.name === q) score = 100;
      // Prefix match
      else if (tool.name.startsWith(q)) score = 80;
      // Contains match
      else if (tool.name.includes(q)) score = 60;
      // Description match
      else if (tool.description.toLowerCase().includes(q)) score = 40;
      // Category match
      else if (tool.category.toLowerCase().includes(q)) score = 30;

      if (score > 0) {
        matches.push({ tool, score });
      }
    }

    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Invoke a tool
   */
  async invoke(toolName, context, input = {}) {
    const tool = this.get(toolName);
    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    if (!tool.enabled) {
      throw new Error(`Tool is disabled: ${toolName}`);
    }

    // Check permissions
    if (tool.requiredPermissions.length > 0) {
      const userPerms = context.user?.permissions || [];
      const hasPermission = userPerms.includes('*') || 
        tool.requiredPermissions.every(p => userPerms.includes(p));
      
      if (!hasPermission) {
        throw new Error(`Permission denied for tool: ${toolName}`);
      }
    }

    // Check rate limit
    if (!this.checkRateLimit(toolName, context.userId)) {
      throw new Error(`Rate limit exceeded for tool: ${toolName}`);
    }

    const startTime = Date.now();
    try {
      const result = await tool.invoke(context, input);
      const duration = Date.now() - startTime;

      this.logInvocation({
        toolName,
        status: 'success',
        duration,
        userId: context.userId,
        input: this.sanitizeInput(input),
        timestamp: new Date()
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logInvocation({
        toolName,
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
   * Check rate limit for a tool
   */
  checkRateLimit(toolName, userId) {
    const tool = this.get(toolName);
    if (!tool) return false;

    const now = Date.now();
    const key = `${toolName}:${userId}`;
    const limit = tool.rateLimitPerMinute;
    const window = 60000; // 1 minute

    // Get recorded invocations in the last minute
    let invocations = this.rateLimits.get(toolName) || [];
    invocations = invocations.filter(t => now - t < window && t.userId === userId);

    if (invocations.length >= limit) {
      return false;
    }

    // Record this invocation
    this.rateLimits.get(toolName).push({ userId, time: now });
    return true;
  }

  /**
   * Log tool invocation
   */
  logInvocation(log) {
    this.invocationLog.push(log);
    if (this.invocationLog.length > this.maxLogSize) {
      this.invocationLog.shift();
    }
  }

  /**
   * Get invocation logs
   */
  getInvocationLog(toolName = null, userId = null, limit = 100) {
    let logs = this.invocationLog;
    if (toolName) {
      logs = logs.filter(l => l.toolName === toolName);
    }
    if (userId) {
      logs = logs.filter(l => l.userId === userId);
    }
    return logs.slice(-limit).reverse();
  }

  /**
   * Get tool stats
   */
  getStats(timeWindowMs = 86400000) {
    const cutoff = Date.now() - timeWindowMs;
    const logs = this.invocationLog.filter(l => new Date(l.timestamp) > cutoff);

    const stats = {
      totalInvocations: logs.length,
      successCount: logs.filter(l => l.status === 'success').length,
      errorCount: logs.filter(l => l.status === 'error').length,
      avgDuration: logs.length > 0 ? logs.reduce((s, l) => s + l.duration, 0) / logs.length : 0,
      byTool: {},
      byCategory: {}
    };

    // Stats by tool
    logs.forEach(log => {
      const tool = this.get(log.toolName);
      if (!stats.byTool[log.toolName]) {
        stats.byTool[log.toolName] = { count: 0, errors: 0, avgDuration: 0 };
      }
      stats.byTool[log.toolName].count++;
      stats.byTool[log.toolName].avgDuration += log.duration;
      if (log.status === 'error') {
        stats.byTool[log.toolName].errors++;
      }

      // Stats by category
      if (tool) {
        if (!stats.byCategory[tool.category]) {
          stats.byCategory[tool.category] = { count: 0, errors: 0 };
        }
        stats.byCategory[tool.category].count++;
        if (log.status === 'error') {
          stats.byCategory[tool.category].errors++;
        }
      }
    });

    // Calculate average durations
    for (const key in stats.byTool) {
      if (stats.byTool[key].count > 0) {
        stats.byTool[key].avgDuration /= stats.byTool[key].count;
      }
    }

    return stats;
  }

  /**
   * Render tool pool as markdown
   */
  renderMarkdown() {
    const lines = ['# Tool Pool', ''];

    // Summary
    lines.push(`Total tools: ${this.tools.size}`);
    lines.push(`Enabled: ${this.getAll().length}`);
    lines.push(`Simple mode: ${this.simpleMode}`);
    lines.push('');

    // By category
    for (const [category, tools] of this.toolsByCategory) {
      lines.push(`## ${category.charAt(0).toUpperCase() + category.slice(1)}`);
      lines.push('');
      for (const tool of tools) {
        const status = tool.enabled ? '✓' : '✗';
        let line = `${status} **${tool.name}** — ${tool.description}`;
        if (tool.experimental) {
          line += ' *(experimental)*';
        }
        lines.push(line);
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Sanitize input for logging
   */
  sanitizeInput(input) {
    const sensitive = ['password', 'token', 'apiKey', 'secret', 'apiSecret'];
    const sanitized = { ...input };
    for (const key in sanitized) {
      if (sensitive.some(s => key.toLowerCase().includes(s))) {
        sanitized[key] = '***';
      }
    }
    return sanitized;
  }

  /**
   * Enable/disable a tool
   */
  setToolEnabled(toolName, enabled) {
    const tool = this.get(toolName);
    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }
    tool.enabled = enabled;
  }

  /**
   * Set permission context
   */
  setPermissionContext(context) {
    this.permissionContext = context;
  }
}

module.exports = ToolPool;
