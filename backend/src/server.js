require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const apiRoutes = require('./routes/index');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    // Allow all origins for now to eliminate CORS blocks
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(express.json());

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
