const { pool } = require('../config/db');

/**
 * Get Store Owner Dashboard
 * Strictly checks that the data belongs to the authenticated store owner.
 * If the owner is not yet assigned to any store, returns a clean empty state.
 */
async function getOwnerDashboard(req, res, next) {
  try {
    const ownerId = req.user.id;

    // Retrieve store assigned to this owner
    const [stores] = await pool.query(
      `SELECT s.id, s.name, s.email, s.address, s.created_at
       FROM stores s
       WHERE s.owner_user_id = ?`,
      [ownerId]
    );

    if (stores.length === 0) {
      return res.status(200).json({
        success: true,
        hasStore: false,
        store: null,
        average_rating: null,
        total_ratings: 0,
        ratings: [],
        message: 'No store has been associated with your account yet. Please contact an administrator.',
      });
    }

    const store = stores[0];

    // Calculate store average rating and total rating count
    const [[aggregate]] = await pool.query(
      `SELECT COALESCE(ROUND(AVG(rating), 2), 0) AS average_rating,
              COUNT(id) AS total_ratings
       FROM ratings
       WHERE store_id = ?`,
      [store.id]
    );

    // Retrieve list of users and ratings for this store
    const [ratings] = await pool.query(
      `SELECT r.id, r.rating, r.created_at, r.updated_at,
              u.id AS user_id, u.name AS user_name, u.email AS user_email
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = ?
       ORDER BY r.updated_at DESC`,
      [store.id]
    );

    return res.status(200).json({
      success: true,
      hasStore: true,
      store,
      average_rating: aggregate.average_rating,
      total_ratings: aggregate.total_ratings,
      ratings,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get ratings specifically for the authenticated owner's store
 */
async function getOwnerRatings(req, res, next) {
  try {
    const ownerId = req.user.id;

    const [stores] = await pool.query(
      'SELECT id, name FROM stores WHERE owner_user_id = ?',
      [ownerId]
    );

    if (stores.length === 0) {
      return res.status(200).json({
        success: true,
        hasStore: false,
        ratings: [],
      });
    }

    const store = stores[0];

    const [ratings] = await pool.query(
      `SELECT r.id, r.rating, r.created_at, r.updated_at,
              u.id AS user_id, u.name AS user_name, u.email AS user_email
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = ?
       ORDER BY r.updated_at DESC`,
      [store.id]
    );

    return res.status(200).json({
      success: true,
      hasStore: true,
      storeName: store.name,
      ratings,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getOwnerDashboard,
  getOwnerRatings,
};
