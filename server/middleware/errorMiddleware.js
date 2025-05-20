// middleware/errorMiddleware.js
const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  let value = "unknown";
  if (err.errmsg && err.errmsg.match(/(["'])(\\?.)*?\1/)) {
    value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  } else if (err.keyValue) {
    value = Object.values(err.keyValue).join(', ');
  }
  const message = `Duplicate field value: ${value}. Please use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401);
const handleJWTExpiredError = () => new AppError('Your token has expired. Please log in again.', 401);

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR 💥 (Development):', err);
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message; // Ensure message is copied

    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    if (error.isOperational) {
      res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    } else {
      console.error('ERROR 💥 (Production - Non-operational):', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong! Please try again later.',
      });
    }
  } else { // Fallback if NODE_ENV is not set
    console.error('ERROR 💥 (Unknown NODE_ENV or fallback):', err);
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    });
  }
};

// If this file ONLY contains the errorHandler
module.exports = errorHandler;

// If this file also contains protect and authorize (which it shouldn't if authMiddleware.js exists)
// module.exports = { errorHandler, protect, authorize };