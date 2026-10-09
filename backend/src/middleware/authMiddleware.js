const { verifyToken, COOKIE_NAME } = require('../utils/token');
const { pool } = require('../config/db');

/**
 * Authenticates request via HttpOnly cookie or Authorization Bearer header
 */
async function authenticate(req, res, next) {
  try {
    let token = req.cookies ? req.cookies[COOKIE_NAME] : null;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to proceed.',
      });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please log in again.',
      });
    }

    const [rows] = await pool.query(
      'SELECT id, name, email, address, role, created_at FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists.',
      });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication: Populates req.user if a valid token is provided,
 * but allows the request to continue unauthenticated otherwise.
 */
async function optionalAuthenticate(req, res, next) {
  try {
    let token = req.cookies ? req.cookies[COOKIE_NAME] : null;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = verifyToken(token);
        const [rows] = await pool.query(
          'SELECT id, name, email, address, role, created_at FROM users WHERE id = ?',
          [decoded.id]
        );
        if (rows.length > 0) {
          req.user = rows[0];
        }
      } catch (e) {
        // Ignore invalid token in optional auth
      }
    }
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  authenticate,
  optionalAuthenticate,
};
