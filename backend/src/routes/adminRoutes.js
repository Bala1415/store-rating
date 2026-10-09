const express = require('express');
const {
  getDashboardStats,
  getUsers,
  createUser,
  getUserById,
  getStores,
  createStore,
} = require('../controllers/adminController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// Enforce ADMIN role for all routes in this router
router.use(authenticate, requireRoles('ADMIN'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.post('/users', createUser);
router.get('/users/:id', getUserById);
router.get('/stores', getStores);
router.post('/stores', createStore);

module.exports = router;
