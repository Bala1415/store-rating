const { pool } = require('../config/db');
const { validateRatingValue } = require('../validators/storeValidators');

/**
 * Get all stores with overall ratings and current user's submitted rating (if logged in)
 */
async function getStores(req, res, next) {
  try {
    const { name, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const currentUserId = req.user ? req.user.id : null;

    const allowedSortFields = {
      name: 's.name',
      address: 's.address',
      average_rating: 'average_rating',
      rating_count: 'rating_count',
      created_at: 's.created_at',
    };

    const sortColumn = allowedSortFields[sortBy] || 's.name';
    const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let query = `
      SELECT s.id, s.name, s.email, s.address, s.created_at,
             COALESCE(ROUND(AVG(r.rating), 2), 0) AS average_rating,
             COUNT(r.id) AS rating_count
             ${currentUserId ? ', (SELECT rating FROM ratings WHERE store_id = s.id AND user_id = ?) AS user_rating' : ', NULL AS user_rating'}
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;
    const params = [];
    if (currentUserId) {
      params.push(currentUserId);
    }

    if (name) {
      query += ' AND s.name LIKE ?';
      params.push(`%${name.trim()}%`);
    }

    if (address) {
      query += ' AND s.address LIKE ?';
      params.push(`%${address.trim()}%`);
    }

    query += ` GROUP BY s.id ORDER BY ${sortColumn} ${direction}`;

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
 * Get single store by ID
 */
async function getStoreById(req, res, next) {
  try {
    const storeId = parseInt(req.params.id, 10);
    if (isNaN(storeId)) {
      return res.status(400).json({ success: false, message: 'Invalid store ID.' });
    }

    const currentUserId = req.user ? req.user.id : null;

    let query = `
      SELECT s.id, s.name, s.email, s.address, s.created_at,
             COALESCE(ROUND(AVG(r.rating), 2), 0) AS average_rating,
             COUNT(r.id) AS rating_count
             ${currentUserId ? ', (SELECT rating FROM ratings WHERE store_id = s.id AND user_id = ?) AS user_rating' : ', NULL AS user_rating'}
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.id = ?
      GROUP BY s.id
    `;

    const params = currentUserId ? [currentUserId, storeId] : [storeId];
    const [stores] = await pool.query(query, params);

    if (stores.length === 0) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    return res.status(200).json({
      success: true,
      store: stores[0],
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Submit or update rating for a store (Normal User only)
 * Upserts: if a rating exists for this user and store, it updates; otherwise inserts.
 */
async function submitOrUpdateRating(req, res, next) {
  try {
    const storeId = parseInt(req.params.id, 10);
    if (isNaN(storeId)) {
      return res.status(400).json({ success: false, message: 'Invalid store ID.' });
    }

    const { rating } = req.body;
    const ratingErr = validateRatingValue(rating);
    if (ratingErr) {
      return res.status(400).json({ success: false, message: ratingErr });
    }

    const numericRating = Number(rating);
    const userId = req.user.id;

    // Verify store exists
    const [stores] = await pool.query('SELECT id, name FROM stores WHERE id = ?', [storeId]);
    if (stores.length === 0) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    // Check if user already submitted a rating for this store
    const [existingRatings] = await pool.query(
      'SELECT id, rating FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    let isUpdate = false;
    if (existingRatings.length > 0) {
      isUpdate = true;
      await pool.query(
        'UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?',
        [numericRating, userId, storeId]
      );
    } else {
      await pool.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        [userId, storeId, numericRating]
      );
    }

    // Fetch updated aggregate rating for this store
    const [[aggregate]] = await pool.query(
      `SELECT COALESCE(ROUND(AVG(rating), 2), 0) AS average_rating,
              COUNT(id) AS rating_count
       FROM ratings
       WHERE store_id = ?`,
      [storeId]
    );

    return res.status(200).json({
      success: true,
      message: isUpdate
        ? `Your rating for "${stores[0].name}" has been updated to ${numericRating} stars.`
        : `Your rating of ${numericRating} stars for "${stores[0].name}" has been submitted.`,
      rating: numericRating,
      storeId,
      average_rating: aggregate.average_rating,
      rating_count: aggregate.rating_count,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStores,
  getStoreById,
  submitOrUpdateRating,
};
