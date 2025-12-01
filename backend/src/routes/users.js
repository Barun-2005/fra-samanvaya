const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  getCurrentUser,
  createUser,
  updateUserStatus,
} = require('../controllers/userController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

router.get('/me', requireAuth, getCurrentUser);
router.get('/', requireAuth, requireRole(['Admin', 'Super Admin']), getAllUsers);
router.get('/:id', requireAuth, requireRole(['Admin', 'Super Admin']), getUserById);
router.post('/', requireAuth, requireRole(['Super Admin']), createUser);
router.put('/:id/status', requireAuth, requireRole(['Super Admin']), updateUserStatus);

module.exports = router;
