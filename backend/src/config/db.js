const mysql = require('mysql2/promise');
const env = require('./env');

const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

/**
 * Test connectivity to the MySQL database
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return { success: true, message: 'Database connection verified' };
  } catch (error) {
    return {
      success: false,
      message: `Failed to connect to MySQL database '${env.DB_NAME}' at ${env.DB_HOST}:${env.DB_PORT}`,
      error: error.message,
      code: error.code,
    };
  }
}

module.exports = {
  pool,
  testConnection,
};
