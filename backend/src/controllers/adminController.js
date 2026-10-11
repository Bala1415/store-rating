const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
  validateRole,
  normalizeEmail,
  normalizeText,
} = require('../validators/authValidators');
const {
  validateStoreName,
  validateStoreEmail,
  validateStoreAddress,
  validateOwnerId,
} = require('../validators/storeValidators');

/**
 * Admin Dashboard Statistics
 */
async function getDashboardStats(req, res, next) {
  try {
    const [[usersCount]] = await pool.query('SELECT COUNT(*) AS count FROM users');
    const [[storesCount]] = await pool.query('SELECT COUNT(*) AS count FROM stores');
    const [[ratingsCount]] = await pool.query('SELECT COUNT(*) AS count FROM ratings');

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers: usersCount.count,
        totalStores: storesCount.count,
        totalRatings: ratingsCount.count,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: List Users with filtering and sorting
 */
async function getUsers(req, res, next) {
  try {
    const { name, email, address, role, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;

    const allowedSortFields = {
      name: 'u.name',
      email: 'u.email',
      address: 'u.address',
      role: 'u.role',
      created_at: 'u.created_at',
    };

    const sortColumn = allowedSortFields[sortBy] || 'u.created_at';
    const direction = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    let query = `
      SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
             ROUND(AVG(r.rating), 2) AS store_rating
      FROM users u
      LEFT JOIN stores s ON (s.owner_user_id = u.id AND u.role = 'STORE_OWNER')
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;
    const params = [];

    if (name) {
      query += ' AND u.name LIKE ?';
      params.push(`%${name.trim()}%`);
    }

    if (email) {
      query += ' AND u.email LIKE ?';
      params.push(`%${email.trim()}%`);
    }

    if (address) {
      query += ' AND u.address LIKE ?';
      params.push(`%${address.trim()}%`);
    }

    if (role) {
      query += ' AND u.role = ?';
      params.push(role.trim().toUpperCase());
    }

    query += ` GROUP BY u.id ORDER BY ${sortColumn} ${direction}`;

    const [users] = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Create a new user (Supports ADMIN, USER, STORE_OWNER)
 */
async function createUser(req, res, next) {
  try {
    const { name, email, password, address, role } = req.body;

    const nameErr = validateName(name, 'User Name');
    if (nameErr) return res.status(400).json({ success: false, message: nameErr });

    const emailErr = validateEmail(email);
    if (emailErr) return res.status(400).json({ success: false, message: emailErr });

    const passwordErr = validatePassword(password);
    if (passwordErr) return res.status(400).json({ success: false, message: passwordErr });

    const addressErr = validateAddress(address);
    if (addressErr) return res.status(400).json({ success: false, message: addressErr });

    const roleErr = validateRole(role);
    if (roleErr) return res.status(400).json({ success: false, message: roleErr });

    const cleanEmail = normalizeEmail(email);
    const cleanName = normalizeText(name);
    const cleanAddress = address ? normalizeText(address) : null;
    const cleanRole = role.trim().toUpperCase();

    // Check email uniqueness
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, address, role) VALUES (?, ?, ?, ?, ?)',
      [cleanName, cleanEmail, passwordHash, cleanAddress, cleanRole]
    );

    const createdUser = {
      id: result.insertId,
      name: cleanName,
      email: cleanEmail,
      address: cleanAddress,
      role: cleanRole,
    };

    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      user: createdUser,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Inspect user details; displays store & ratings info if user is a Store Owner
 */
async function getUserById(req, res, next) {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID.' });
    }

    const [users] = await pool.query(
      'SELECT id, name, email, address, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = users[0];
    let storeInfo = null;

    if (user.role === 'STORE_OWNER') {
      const [stores] = await pool.query(
        `SELECT s.id, s.name, s.email, s.address, s.created_at,
                COALESCE(ROUND(AVG(r.rating), 2), 0) AS average_rating,
                COUNT(r.id) AS rating_count
         FROM stores s
         LEFT JOIN ratings r ON s.id = r.store_id
         WHERE s.owner_user_id = ?
         GROUP BY s.id`,
        [userId]
      );
      storeInfo = stores.length > 0 ? stores[0] : null;
    }

    return res.status(200).json({
      success: true,
      user,
      store: storeInfo,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: List Stores with filtering and sorting
 */
async function getStores(req, res, next) {
  try {
    const { name, email, address, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;

    const allowedSortFields = {
      name: 's.name',
      email: 's.email',
      address: 's.address',
      created_at: 's.created_at',
      average_rating: 'average_rating',
      rating_count: 'rating_count',
    };

    const sortColumn = allowedSortFields[sortBy] || 's.created_at';
    const direction = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    let query = `
      SELECT s.id, s.name, s.email, s.address, s.owner_user_id, s.created_at,
             u.name AS owner_name, u.email AS owner_email,
             COALESCE(ROUND(AVG(r.rating), 2), 0) AS average_rating,
             COUNT(r.id) AS rating_count
      FROM stores s
      JOIN users u ON s.owner_user_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;
    const params = [];

    if (name) {
      query += ' AND s.name LIKE ?';
      params.push(`%${name.trim()}%`);
    }

    if (email) {
      query += ' AND s.email LIKE ?';
      params.push(`%${email.trim()}%`);
    }

    if (address) {
      query += ' AND s.address LIKE ?';
      params.push(`%${address.trim()}%`);
    }

    query += ` GROUP BY s.id, u.name, u.email ORDER BY ${sortColumn} ${direction}`;

    const [stores] = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      count: stores.length,
      stores,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Create a new Store and associate it with a Store Owner
 */
async function createStore(req, res, next) {
  try {
    const { name, email, address, owner_user_id } = req.body;

    const nameErr = validateStoreName(name);
    if (nameErr) return res.status(400).json({ success: false, message: nameErr });

    const emailErr = validateStoreEmail(email);
    if (emailErr) return res.status(400).json({ success: false, message: emailErr });

    const addressErr = validateStoreAddress(address);
    if (addressErr) return res.status(400).json({ success: false, message: addressErr });

    const ownerErr = validateOwnerId(owner_user_id);
    if (ownerErr) return res.status(400).json({ success: false, message: ownerErr });

    // Validate that owner exists and has role STORE_OWNER
    const [owners] = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [owner_user_id]
    );

    if (owners.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'The selected user does not exist.',
      });
    }

    if (owners[0].role !== 'STORE_OWNER') {
      return res.status(400).json({
        success: false,
        message: `The user must have the STORE_OWNER role. Selected user has role: ${owners[0].role}`,
      });
    }

    const cleanName = normalizeText(name);
    const cleanEmail = normalizeEmail(email);
    const cleanAddress = address ? normalizeText(address) : null;

    const [result] = await pool.query(
      'INSERT INTO stores (name, email, address, owner_user_id) VALUES (?, ?, ?, ?)',
      [cleanName, cleanEmail, cleanAddress, owner_user_id]
    );

    const createdStore = {
      id: result.insertId,
      name: cleanName,
      email: cleanEmail,
      address: cleanAddress,
      owner_user_id,
      owner_name: owners[0].name,
    };

    return res.status(201).json({
      success: true,
      message: 'Store created successfully.',
      store: createdStore,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardStats,
  getUsers,
  createUser,
  getUserById,
  getStores,
  createStore,
};
