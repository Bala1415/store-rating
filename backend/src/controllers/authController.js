const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
  normalizeEmail,
  normalizeText,
} = require('../validators/authValidators');
const { generateToken, setTokenCookie, clearTokenCookie } = require('../utils/token');

/**
 * Public User Signup (Always assigns role 'USER')
 */
async function signup(req, res, next) {
  try {
    const { name, email, password, address } = req.body;

    // Validate inputs against assignment rules
    const nameErr = validateName(name, 'User Name');
    if (nameErr) return res.status(400).json({ success: false, message: nameErr });

    const emailErr = validateEmail(email);
    if (emailErr) return res.status(400).json({ success: false, message: emailErr });

    const passwordErr = validatePassword(password);
    if (passwordErr) return res.status(400).json({ success: false, message: passwordErr });

    const addressErr = validateAddress(address);
    if (addressErr) return res.status(400).json({ success: false, message: addressErr });

    const cleanEmail = normalizeEmail(email);
    const cleanName = normalizeText(name);
    const cleanAddress = address ? normalizeText(address) : null;

    // Check email uniqueness
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Hash password with bcrypt (salt rounds = 10)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert with strictly enforced 'USER' role
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, address, role) VALUES (?, ?, ?, ?, ?)',
      [cleanName, cleanEmail, passwordHash, cleanAddress, 'USER']
    );

    const newUser = {
      id: result.insertId,
      name: cleanName,
      email: cleanEmail,
      address: cleanAddress,
      role: 'USER',
    };

    // Generate JWT and set HttpOnly cookie
    const token = generateToken(newUser);
    setTokenCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Unified Login for all 3 roles (ADMIN, USER, STORE_OWNER)
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const cleanEmail = normalizeEmail(email);

    // Query user by email
    const [rows] = await pool.query(
      'SELECT id, name, email, password_hash, address, role, created_at FROM users WHERE email = ?',
      [cleanEmail]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = rows[0];

    // Verify password hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      created_at: user.created_at,
    };

    // Issue JWT cookie
    const token = generateToken(safeUser);
    setTokenCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Logout - clears HttpOnly authentication cookie
 */
async function logout(req, res) {
  clearTokenCookie(res);
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
}

/**
 * Get Authenticated User Profile
 */
async function getMe(req, res) {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
}

/**
 * Password Update for authenticated users
 */
async function changePassword(req, res, next) {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are both required.',
      });
    }

    const passwordErr = validatePassword(newPassword);
    if (passwordErr) {
      return res.status(400).json({ success: false, message: passwordErr });
    }

    // Fetch stored hash
    const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isOldMatch = await bcrypt.compare(oldPassword, rows[0].password_hash);
    if (!isOldMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match.',
      });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password.',
      });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  signup,
  login,
  logout,
  getMe,
  changePassword,
};
