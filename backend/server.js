require('dotenv').config();
const http     = require('http');
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');
const rateLimit = require('express-rate-limit');

const app        = express();
const httpServer = http.createServer(app);
const useLocalDb = process.env.LOCAL_DB === 'true';

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { attachValidators } = require('./middleware/validation');

// Disable Mongoose query buffering so DB issues fail fast (no 10s buffering timeouts)
mongoose.set('bufferCommands', false);

// ── Core middleware ────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate limiting ──────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
});

const mlLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
});

app.use(generalLimiter);

// ── Attach validators ──────────────────────────────
app.use(attachValidators);

// ── Request logging (compact) ──────────────────────
app.use((req, _res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`${req.method} ${req.path}`);
  }
  next();
});

// ── MongoDB ────────────────────────────────────────
if (!useLocalDb) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agritech', {
    serverSelectionTimeoutMS: 5000,
  })
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB:', err.message));
} else {
  console.log('🗄️  LOCAL_DB mode enabled (JSON file storage)');
}

// ── Redis (non-blocking — app starts even if Redis is down) ───
require('./config/redis').getRedisClient().catch(() => {});

// ── Socket.io ──────────────────────────────────────
const { initSocket } = require('./config/socket');
initSocket(httpServer);

// ── DB readiness guard ─────────────────────────────
app.use((req, res, next) => {
  // Allow health checks even when DB is down
  if (req.path === '/health') return next();

  if (useLocalDb) return next();

  // 1 = connected
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: 'Database unavailable. Start MongoDB and try again.',
    });
  }

  return next();
});

// ── API Routes ─────────────────────────────────────
app.use('/api/auth',            authLimiter, require('./routes/auth'));
app.use('/api/dashboard',       require('./routes/dashboard'));
app.use('/api/farms',           require('./routes/farms'));
app.use('/api/soil',            require('./routes/soil'));
app.use('/api/crops',           require('./routes/crops'));
app.use('/api/crops',           require('./routes/cropAnalysis'));
app.use('/api/predictions',     mlLimiter, require('./routes/predictions'));
app.use('/api/chat',            require('./routes/chat'));
app.use('/api/weather',         require('./routes/weather'));
app.use('/api/alerts',          require('./routes/alerts'));
app.use('/api/command',         require('./routes/command')); // Enhanced command routing (Claw Code inspired)
app.use('/api/crop-rotation',   require('./routes/cropRotation')); // Genetic Algorithm crop rotation

// ── Serve uploaded images ──────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Health check ───────────────────────────────────
app.get('/health', async (_req, res) => {
  const dbState = useLocalDb
    ? 'local-json'
    : (mongoose.connection.readyState === 1 ? 'connected' : 'disconnected');
  res.json({
    status:    'ok',
    service:   'agritech-backend',
    db:        dbState,
    uptime:    Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// ── 404 handler ────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND',
      statusCode: 404,
      timestamp: new Date().toISOString()
    }
  });
});

// ── Global error handler (must be last) ───────────
app.use(errorHandler);

// ── Start ──────────────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket ready on ws://localhost:${PORT}`);
});
// ── Global error handlers (catch unhandled rejections) ───────
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});
module.exports = app;
