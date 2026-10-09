const express = require('express');
const { getOwnerDashboard, getOwnerRatings } = require('../controllers/ownerController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// Enforce STORE_OWNER role for all owner endpoints
router.use(authenticate, requireRoles('STORE_OWNER'));

router.get('/dashboard', getOwnerDashboard);
router.get('/ratings', getOwnerRatings);

module.exports = router;
