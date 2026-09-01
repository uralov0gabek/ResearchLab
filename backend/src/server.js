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

const allowedOrigins = ['https://research-lab-v.vercel.app', 'http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Rate Limiting
if (process.env.NODE_ENV !== 'test') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
  });
  app.use('/api/', limiter);
}

const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(express.json({ limit: '10kb' })); // Body limit is 10kb
// app.use(xss()); // Data sanitization against XSS (Deprecated, removed)
app.use(hpp()); // Prevent parameter pollution

// Routes
app.use('/api', apiRoutes);

// Basic Health Check Route
app.get('/', (req, res) => {
  res.send('Research Lab Backend API is running');
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
