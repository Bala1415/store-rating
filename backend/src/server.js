const app = require('./app');
const env = require('./config/env');
const { testConnection } = require('./config/db');

const PORT = env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`Store Rating API Server running on port ${PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
  console.log(`Frontend URL: ${env.FRONTEND_URL}`);
  console.log(`====================================================`);

  const dbStatus = await testConnection();
  if (dbStatus.success) {
    console.log(`[DB SUCCESS] Connected to MySQL database '${env.DB_NAME}' successfully.`);
  } else {
    console.warn(`[DB WARNING] Could not connect to MySQL database: ${dbStatus.message}`);
    console.warn(`Ensure MySQL is running and credentials in backend/.env are configured.`);
  }
});

module.exports = server;
