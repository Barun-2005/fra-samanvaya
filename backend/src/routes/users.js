const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  getCurrentUser,
} = require('../controllers/userController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

router.get('/me', requireAuth, getCurrentUser);
router.get('/', requireAuth, requireRole(['Admin', 'SuperAdmin']), getAllUsers);
router.get('/:id', requireAuth, requireRole(['Admin', 'SuperAdmin']), getUserById);

module.exports = router;
