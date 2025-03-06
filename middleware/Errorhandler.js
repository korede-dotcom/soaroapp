const AppError = require('../utils/AppError'); // Import the custom error class

// Global Error Handler
const errorHandler = (err, req, res, next) => {
  // Operational errors should be passed to the client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // For programming or unknown errors, send a generic message and log the error for debugging
  console.error('ERROR 💥:', err);

  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong! Please try again later.',
  });
};

module.exports = errorHandler;
