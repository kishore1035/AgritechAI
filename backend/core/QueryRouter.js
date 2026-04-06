/**
 * QueryRouter - Routes farmer queries to appropriate commands/tools
 * Inspired by Claw Code's query engine and routing patterns
 */

const { QueryRoute, TurnResult } = require('./types');

class QueryRouter {
  constructor(commandRegistry, toolPool) {
    this.commandRegistry = commandRegistry;
    this.toolPool = toolPool;
    this.routingHistory = [];
    this.maxHistorySize = 5000;
  }

  /**
   * Route a query to commands and tools
   */
  route(query, limit = 5) {
    const route = new QueryRoute(query, [], [], 0);

    // Try to match commands
    const commandMatches = this.commandRegistry.getByQuery(query);
    commandMatches.slice(0, limit).forEach(({ command, score }) => {
      route.addCommand(command, score);
      route.confidence = Math.max(route.confidence, score);
    });

    // Try to match tools
    const toolMatches = this.toolPool.findByQuery(query, limit);
    toolMatches.forEach(({ tool, score }) => {
      route.addTool(tool, score);
      route.confidence = Math.max(route.confidence, score);
    });

    // Record routing
    this.routingHistory.push({
      query,
      route,
      timestamp: new Date(),
      commandMatchCount: route.matchedCommands.length,
      toolMatchCount: route.matchedTools.length,
      confidence: route.confidence
    });

    if (this.routingHistory.length > this.maxHistorySize) {
      this.routingHistory.shift();
    }

    return route;
  }

  /**
   * Execute a routed query
   */
  async executeRoute(route, context, params = {}) {
    const turnResult = new TurnResult(route.query, '', route);
    const errors = [];

    // Try to execute best matching command
    if (route.matchedCommands.length > 0) {
      const topCommand = route.matchedCommands[0];
      try {
        const result = await this.commandRegistry.execute(
          topCommand.command.name,
          context,
          params
        );
        turnResult.addCommandExecution(topCommand.command.name, result);
        turnResult.output = this.formatOutput(result);
        return turnResult;
      } catch (error) {
        errors.push(`Command execution failed: ${error.message}`);
      }
    }

    // Try to execute best matching tool
    if (route.matchedTools.length > 0) {
      const topTool = route.matchedTools[0];
      try {
        const result = await this.toolPool.invoke(
          topTool.tool.name,
          context,
          params
        );
        turnResult.addToolExecution(topTool.tool.name, result);
        turnResult.output = this.formatOutput(result);
        return turnResult;
      } catch (error) {
        errors.push(`Tool execution failed: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      turnResult.output = `Failed to process query: ${errors.join('; ')}`;
      turnResult.stopReason = 'execution_failed';
    } else {
      turnResult.output = 'No matching command or tool found for your query.';
      turnResult.stopReason = 'no_match';
    }

    return turnResult;
  }

  /**
   * Process a query end-to-end
   */
  async processQuery(query, context, params = {}, options = {}) {
    const maxAttempts = options.maxAttempts || 3;
    const fallbackToGeneric = options.fallbackToGeneric !== false;

    let attempt = 0;
    let route = null;
    let result = null;

    while (attempt < maxAttempts) {
      try {
        // Route the query
        route = this.route(query, options.matchLimit || 5);

        if (route.matchedCommands.length === 0 && route.matchedTools.length === 0) {
          if (fallbackToGeneric) {
            // Try to suggest similar queries
            const suggestions = this.getSuggestions(query);
            result = new TurnResult(query, '', null);
            result.output = this.formatSuggestions(query, suggestions);
            result.stopReason = 'no_match_with_suggestions';
            return result;
          } else {
            throw new Error('No matching command or tool found');
          }
        }

        // Execute the route
        result = await this.executeRoute(route, context, params);
        return result;
      } catch (error) {
        attempt++;
        if (attempt >= maxAttempts) {
          result = new TurnResult(query, '', route);
          result.output = `Error processing query (attempt ${attempt}/${maxAttempts}): ${error.message}`;
          result.stopReason = 'max_retries_exceeded';
          return result;
        }
      }
    }

    return result;
  }

  /**
   * Get suggestions for a query
   */
  getSuggestions(query, limit = 3) {
    const suggestions = [];

    // Get similar commands
    const commands = this.commandRegistry.getByQuery(query);
    suggestions.push(
      ...commands.slice(0, limit).map(({ command, score }) => ({
        type: 'command',
        name: command.name,
        description: command.description,
        score
      }))
    );

    // Get similar tools
    const tools = this.toolPool.findByQuery(query, limit);
    suggestions.push(
      ...tools.slice(0, limit).map(({ tool, score }) => ({
        type: 'tool',
        name: tool.name,
        description: tool.description,
        score
      }))
    );

    return suggestions.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  /**
   * Format suggestions for display
   */
  formatSuggestions(query, suggestions) {
    let output = `No exact match found for: "${query}"\n\nDid you mean one of these?\n\n`;
    suggestions.forEach(s => {
      output += `• **${s.name}** (${s.type}) — ${s.description}\n`;
    });
    return output;
  }

  /**
   * Format output for display
   */
  formatOutput(result) {
    if (typeof result === 'string') {
      return result;
    }
    if (typeof result === 'object') {
      if (result.message) return result.message;
      if (result.output) return result.output;
      return JSON.stringify(result, null, 2);
    }
    return String(result);
  }

  /**
   * Get routing statistics
   */
  getRoutingStats(timeWindowMs = 86400000) {
    const cutoff = Date.now() - timeWindowMs;
    const logs = this.routingHistory.filter(l => new Date(l.timestamp) > cutoff);

    const stats = {
      totalQueries: logs.length,
      avgConfidence: logs.length > 0 ? logs.reduce((s, l) => s + l.confidence, 0) / logs.length : 0,
      queriesWithMatches: logs.filter(l => l.commandMatchCount > 0 || l.toolMatchCount > 0).length,
      matchByType: {
        commandOnly: logs.filter(l => l.commandMatchCount > 0 && l.toolMatchCount === 0).length,
        toolOnly: logs.filter(l => l.commandMatchCount === 0 && l.toolMatchCount > 0).length,
        both: logs.filter(l => l.commandMatchCount > 0 && l.toolMatchCount > 0).length,
        neither: logs.filter(l => l.commandMatchCount === 0 && l.toolMatchCount === 0).length
      }
    };

    return stats;
  }

  /**
   * Get routing history
   */
  getRoutingHistory(limit = 100) {
    return this.routingHistory.slice(-limit).reverse();
  }

  /**
   * Render routing info as markdown
   */
  renderMarkdown() {
    const stats = this.getRoutingStats();
    return `# Query Router Status

- Total queries: ${stats.totalQueries}
- Average confidence: ${stats.avgConfidence.toFixed(2)}%
- Queries with matches: ${stats.queriesWithMatches}

## Match Distribution
- Command only: ${stats.matchByType.commandOnly}
- Tool only: ${stats.matchByType.toolOnly}
- Both: ${stats.matchByType.both}
- No match: ${stats.matchByType.neither}
`;
  }
}

module.exports = QueryRouter;
