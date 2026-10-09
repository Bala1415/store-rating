const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const env = require('../config/env');

async function initDatabase() {
  console.log(`[DB INIT] Connecting to MySQL server at ${env.DB_HOST}:${env.DB_PORT} as '${env.DB_USER}'...`);

  // Initial connection without specific database to create it if it doesn't exist
  let connection;
  try {
    connection = await mysql.createConnection({
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      multipleStatements: true,
    });
    console.log('[DB INIT] Successfully connected to MySQL server.');
  } catch (err) {
    console.error('[DB INIT ERROR] Could not connect to MySQL server:', err.message);
    console.error('Please verify your DB_HOST, DB_PORT, DB_USER, and DB_PASSWORD in backend/.env');
    process.exit(1);
  }

  try {
    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    console.log(`[DB INIT] Executing schema from ${schemaPath}...`);

    await connection.query(schemaSql);
    console.log('[DB INIT SUCCESS] Database `store_rating_db` and tables created successfully!');

    // Verify tables
    await connection.query(`USE \`${env.DB_NAME}\``);
    const [tables] = await connection.query('SHOW TABLES');
    console.log('[DB INIT VERIFIED] Existing tables:');
    tables.forEach((row) => {
      console.log(` - ${Object.values(row)[0]}`);
    });
  } catch (error) {
    console.error('[DB INIT ERROR] Failed executing schema:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;
