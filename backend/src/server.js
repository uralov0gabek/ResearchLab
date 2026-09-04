require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const hpp = require('hpp');

const apiRoutes = require('./routes/index');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

const frontendUrl = process.env.FRONTEND_URL || 'https://research-lab-v.vercel.app';
const allowedOrigins = [frontendUrl, 'http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Rate Limiting
if (process.env.NODE_ENV !== 'test') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10000,
    message: 'Too many requests from this IP, please try again later.'
  });
  app.use('/api/', limiter);
}

const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(express.json({ limit: '500kb' })); // Increased body limit to accommodate large survey submissions
// app.use(xss()); // Data sanitization against XSS (Deprecated, removed)
app.use(hpp()); // Prevent parameter pollution

// Routes
app.use('/api', apiRoutes);

// Basic Health Check Route
app.get('/', (req, res) => {
  res.send('Research Lab Backend API is running');
});

// Health check endpoint for frontend to ping
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend is awake and healthy' });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Global unhandled promise rejection and uncaught exception handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Do not exit the process, just log it so the server stays up
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
  // Do not exit the process, just log it so the server stays up
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
