/**
 * Centralized Error Handling Middleware
 */

function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(err, req, res, next) {
  // Log unexpected errors for server diagnostics
  if (process.env.NODE_ENV !== 'test') {
    console.error('Unhandled Error:', err.message || err);
  }

  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific MySQL errors
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    if (err.message.includes('uk_users_email') || err.message.includes('email')) {
      message = 'An account with this email address already exists.';
    } else if (err.message.includes('uk_user_store_rating')) {
      message = 'You have already rated this store.';
    } else {
      message = 'A conflicting record already exists.';
    }
  } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    message = 'Invalid reference: The associated user or store does not exist.';
  } else if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
    statusCode = 400;
    message = 'Data integrity violation: The input violates database constraints.';
  } else if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    statusCode = 503;
    message = 'Database service is currently unreachable. Please check MySQL server status.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && statusCode === 500 ? { debug: err.stack } : {}),
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
