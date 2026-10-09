const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env if present
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Database settings
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT, 10) || 3306,
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'store_rating_db',

  // Authentication settings
  JWT_SECRET: process.env.JWT_SECRET || 'dev_jwt_secret_roxiler_challenge_2026_super_secure',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  COOKIE_MAX_AGE_DAYS: parseInt(process.env.COOKIE_MAX_AGE_DAYS, 10) || 1,
};

module.exports = env;
