/**
 * Centralized error handling middleware.
 * Catches errors from routes and formats them into a standard JSON response.
 */
const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]:', err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: message,
    // Include stack trace only in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  errorHandler
};
