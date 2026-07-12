const ApiError = require('../utils/ApiError');

// 404 handler - must be mounted after all routes
function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// Centralized error handler - must be mounted last
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = err.details || null;

  // better-sqlite3 constraint violations
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    statusCode = 409;
    message = 'A record with this value already exists';
  } else if (err.code && err.code.startsWith('SQLITE_CONSTRAINT')) {
    statusCode = 400;
    message = 'Database constraint violation: ' + err.message;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  let errors = err.errors || null;
  if (details && Array.isArray(details)) {
    errors = {};
    details.forEach((d) => {
      if (d.field) {
        errors[d.field] = d.message;
      }
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(details ? { details } : {}),
  });
}

module.exports = { notFound, errorHandler };
