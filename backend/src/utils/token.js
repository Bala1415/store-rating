const jwt = require('jsonwebtoken');
const env = require('../config/env');

const COOKIE_NAME = 'auth_token';

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

function setTokenCookie(res, token) {
  const maxAge = env.COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  });
}

function clearTokenCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

module.exports = {
  COOKIE_NAME,
  generateToken,
  verifyToken,
  setTokenCookie,
  clearTokenCookie,
};
