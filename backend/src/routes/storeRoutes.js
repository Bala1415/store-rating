const express = require('express');
const {
  getStores,
  getStoreById,
  submitOrUpdateRating,
} = require('../controllers/storeController');
const { authenticate, optionalAuthenticate } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// Store discovery (public or authenticated)
router.get('/', optionalAuthenticate, getStores);
router.get('/:id', optionalAuthenticate, getStoreById);

// Submit or modify rating (Normal Users only)
router.post('/:id/ratings', authenticate, requireRoles('USER'), submitOrUpdateRating);
router.patch('/:id/ratings', authenticate, requireRoles('USER'), submitOrUpdateRating);

module.exports = router;
