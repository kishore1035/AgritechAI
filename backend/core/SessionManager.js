/**
 * SessionManager - Manages user sessions and conversation history
 * Inspired by Claw Code's session store architecture
 */

const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class Session {
  constructor(sessionId, userId, farmId = null) {
    this.sessionId = sessionId;
    this.userId = userId;
    this.farmId = farmId;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.turns = [];
    this.metadata = {};
    this.isActive = true;
  }

  addTurn(prompt, result) {
    this.turns.push({
      number: this.turns.length + 1,
      prompt,
      result,
      timestamp: new Date()
    });
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      farmId: this.farmId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      turnCount: this.turns.length,
      isActive: this.isActive,
      metadata: this.metadata,
      turns: this.turns
    };
  }

  static fromJSON(data) {
    const session = new Session(data.sessionId, data.userId, data.farmId);
    session.createdAt = new Date(data.createdAt);
    session.updatedAt = new Date(data.updatedAt);
    session.turns = data.turns || [];
    session.metadata = data.metadata || {};
    session.isActive = data.isActive !== false;
    return session;
  }
}

class SessionManager {
  constructor(storePath = './data/sessions') {
    this.storePath = storePath;
    this.activeSessions = new Map(); // In-memory cache
    this.sessionIndex = new Map(); // userId -> [sessionIds]
    this.maxActiveSessions = 1000;
    this.maxSessionAge = 30 * 24 * 60 * 60 * 1000; // 30 days
  }

  /**
   * Initialize session storage
   */
  async init() {
    try {
      await fs.mkdir(this.storePath, { recursive: true });
    } catch (error) {
      console.error('Failed to initialize session storage:', error);
    }
  }

  /**
   * Create a new session
   */
  async createSession(userId, farmId = null) {
    const sessionId = uuidv4();
    const session = new Session(sessionId, userId, farmId);

    // Cache in memory
    this.activeSessions.set(sessionId, session);

    // Index by user
    if (!this.sessionIndex.has(userId)) {
      this.sessionIndex.set(userId, []);
    }
    this.sessionIndex.get(userId).push(sessionId);

    // Persist to disk
    await this.saveSession(session);

    return session;
  }

  /**
   * Get a session by ID
   */
  async getSession(sessionId) {
    // Check memory cache first
    if (this.activeSessions.has(sessionId)) {
      return this.activeSessions.get(sessionId);
    }

    // Load from disk
    const session = await this.loadSession(sessionId);
    if (session) {
      this.activeSessions.set(sessionId, session);
    }
    return session;
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId, limit = 100, activeOnly = true) {
    const sessionIds = this.sessionIndex.get(userId) || [];
    const sessions = [];

    for (const sessionId of sessionIds.slice(-limit)) {
      const session = await this.getSession(sessionId);
      if (session && (!activeOnly || session.isActive)) {
        sessions.push(session);
      }
    }

    return sessions.reverse(); // Most recent first
  }

  /**
   * Add a turn to a session
   */
  async addTurn(sessionId, prompt, result) {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    session.addTurn(prompt, result);
    await this.saveSession(session);
    return session;
  }

  /**
   * Close a session
   */
  async closeSession(sessionId) {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    session.isActive = false;
    session.updatedAt = new Date();
    await this.saveSession(session);
  }

  /**
   * Save session to disk
   */
  async saveSession(session) {
    try {
      const filePath = path.join(this.storePath, `${session.sessionId}.json`);
      await fs.writeFile(filePath, JSON.stringify(session.toJSON(), null, 2), 'utf8');
    } catch (error) {
      console.error(`Failed to save session ${session.sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Load session from disk
   */
  async loadSession(sessionId) {
    try {
      const filePath = path.join(this.storePath, `${sessionId}.json`);
      const data = await fs.readFile(filePath, 'utf8');
      return Session.fromJSON(JSON.parse(data));
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error(`Failed to load session ${sessionId}:`, error);
      }
      return null;
    }
  }

  /**
   * Get session summary
   */
  async getSessionSummary(sessionId) {
    const session = await this.getSession(sessionId);
    if (!session) {
      return null;
    }

    return {
      sessionId: session.sessionId,
      userId: session.userId,
      farmId: session.farmId,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      turnCount: session.turns.length,
      isActive: session.isActive,
      totalPromptLength: session.turns.reduce((s, t) => s + (t.prompt?.length || 0), 0),
      totalOutputLength: session.turns.reduce((s, t) => s + (t.result?.output?.length || 0), 0)
    };
  }

  /**
   * Get session statistics
   */
  async getSessionStats(userId = null) {
    let sessions = [];

    if (userId) {
      sessions = await this.getUserSessions(userId, 1000, false);
    } else {
      // Get all active sessions
      for (const session of this.activeSessions.values()) {
        sessions.push(session);
      }
    }

    const stats = {
      totalSessions: sessions.length,
      activeSessions: sessions.filter(s => s.isActive).length,
      closedSessions: sessions.filter(s => !s.isActive).length,
      totalTurns: sessions.reduce((s, sess) => s + sess.turns.length, 0),
      avgTurnsPerSession: sessions.length > 0 
        ? sessions.reduce((s, sess) => s + sess.turns.length, 0) / sessions.length 
        : 0,
      oldestSession: sessions.length > 0 
        ? new Date(Math.min(...sessions.map(s => new Date(s.createdAt).getTime())))
        : null,
      newestSession: sessions.length > 0 
        ? new Date(Math.max(...sessions.map(s => new Date(s.updatedAt).getTime())))
        : null
    };

    return stats;
  }

  /**
   * Cleanup old sessions
   */
  async cleanup() {
    try {
      const files = await fs.readdir(this.storePath);
      const now = Date.now();
      let deleted = 0;

      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const filePath = path.join(this.storePath, file);
        const stat = await fs.stat(filePath);
        const age = now - stat.mtimeMs;

        if (age > this.maxSessionAge) {
          await fs.unlink(filePath);
          const sessionId = file.replace('.json', '');
          this.activeSessions.delete(sessionId);
          deleted++;
        }
      }

      console.log(`Cleaned up ${deleted} old session files`);
      return deleted;
    } catch (error) {
      console.error('Session cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Export session as markdown
   */
  async exportSessionMarkdown(sessionId) {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    let markdown = `# Session ${session.sessionId}\n\n`;
    markdown += `**User:** ${session.userId}\n`;
    markdown += `**Farm:** ${session.farmId || 'N/A'}\n`;
    markdown += `**Created:** ${session.createdAt.toISOString()}\n`;
    markdown += `**Last Updated:** ${session.updatedAt.toISOString()}\n`;
    markdown += `**Status:** ${session.isActive ? 'Active' : 'Closed'}\n\n`;

    markdown += `## Conversation\n\n`;
    for (const turn of session.turns) {
      markdown += `### Turn ${turn.number}\n`;
      markdown += `**Prompt:** ${turn.prompt}\n\n`;
      markdown += `**Response:**\n${turn.result.output}\n\n`;
      markdown += `---\n\n`;
    }

    return markdown;
  }
}

module.exports = { SessionManager, Session };
