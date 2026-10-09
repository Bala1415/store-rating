const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const env = require('../config/env');

async function seedDatabase() {
  console.log(`[DB SEED] Seeding database '${env.DB_NAME}'...`);

  let connection;
  try {
    connection = await mysql.createConnection({
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
    });
  } catch (err) {
    console.error('[DB SEED ERROR] Connection failed:', err.message);
    process.exit(1);
  }

  try {
    // Generate password hashes
    const adminPassHash = await bcrypt.hash('Admin@1234', 10);
    const ownerPassHash = await bcrypt.hash('Owner@1234', 10);
    const userPassHash = await bcrypt.hash('User@1234', 10);

    // Disable foreign key checks for clean reseeding
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE ratings');
    await connection.query('TRUNCATE TABLE stores');
    await connection.query('TRUNCATE TABLE users');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('[DB SEED] Inserting users...');
    const users = [
      ['System Administrator Roxiler', 'admin@roxiler.com', adminPassHash, '100 Corporate Parkway, Suite 500, Tech District', 'ADMIN'],
      ['Store Owner Alice Downtown', 'alice.owner@roxiler.com', ownerPassHash, '456 Commerce Boulevard, West End', 'STORE_OWNER'],
      ['Store Owner Robert Boulevard', 'robert.owner@roxiler.com', ownerPassHash, '789 Market Avenue, North Quarter', 'STORE_OWNER'],
      ['Store Owner Charles Unassigned', 'charles.owner@roxiler.com', ownerPassHash, '12 Horizon Way, Uptown District', 'STORE_OWNER'],
      ['Customer Christopher Davies', 'chris.user@gmail.com', userPassHash, '321 Elm Street, Apartment 4B', 'USER'],
      ['Customer Samantha Kensington', 'samantha.user@gmail.com', userPassHash, '654 Pine Crest Lane, Suburbia', 'USER'],
      ['Customer Alexander Hamilton', 'alex.user@gmail.com', userPassHash, '987 Cedar Ridge Road, Old Town', 'USER'],
    ];

    for (const u of users) {
      await connection.query(
        'INSERT INTO users (name, email, password_hash, address, role) VALUES (?, ?, ?, ?, ?)',
        u
      );
    }

    // Retrieve inserted user IDs
    const [userRows] = await connection.query('SELECT id, email, role FROM users');
    const userMap = {};
    userRows.forEach((r) => {
      userMap[r.email] = r.id;
    });

    console.log('[DB SEED] Inserting stores...');
    const stores = [
      ['Downtown Gourmet Artisan Bakery', 'contact@downtownbakery.com', '456 Commerce Boulevard, West End', userMap['alice.owner@roxiler.com']],
      ['Apex Electronics & Gadgets Hub', 'support@apexelectronics.com', '789 Market Avenue, North Quarter', userMap['robert.owner@roxiler.com']],
      ['Metropolis Fresh Organic Market', 'info@metropolisorganic.com', '102 Greenbelt Plaza, Central City', userMap['alice.owner@roxiler.com']],
    ];

    for (const s of stores) {
      await connection.query(
        'INSERT INTO stores (name, email, address, owner_user_id) VALUES (?, ?, ?, ?)',
        s
      );
    }

    // Retrieve inserted store IDs
    const [storeRows] = await connection.query('SELECT id, name FROM stores');
    const storeMap = {};
    storeRows.forEach((s) => {
      storeMap[s.name] = s.id;
    });

    console.log('[DB SEED] Inserting ratings...');
    const ratings = [
      [userMap['chris.user@gmail.com'], storeMap['Downtown Gourmet Artisan Bakery'], 5],
      [userMap['samantha.user@gmail.com'], storeMap['Downtown Gourmet Artisan Bakery'], 4],
      [userMap['chris.user@gmail.com'], storeMap['Apex Electronics & Gadgets Hub'], 3],
      [userMap['alex.user@gmail.com'], storeMap['Apex Electronics & Gadgets Hub'], 4],
      [userMap['samantha.user@gmail.com'], storeMap['Metropolis Fresh Organic Market'], 5],
    ];

    for (const r of ratings) {
      await connection.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        r
      );
    }

    console.log('[DB SEED SUCCESS] Seed data populated successfully!');
    console.log('Sample Accounts for Demonstration:');
    console.log(' - Admin:       admin@roxiler.com        / Admin@1234');
    console.log(' - Store Owner: alice.owner@roxiler.com  / Owner@1234 (Assigned to 2 stores)');
    console.log(' - Store Owner: robert.owner@roxiler.com / Owner@1234 (Assigned to 1 store)');
    console.log(' - Store Owner: charles.owner@roxiler.com/ Owner@1234 (No stores assigned - empty state test)');
    console.log(' - Normal User: chris.user@gmail.com     / User@1234');
    console.log(' - Normal User: samantha.user@gmail.com  / User@1234');
  } catch (error) {
    console.error('[DB SEED ERROR] Failed seeding database:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
