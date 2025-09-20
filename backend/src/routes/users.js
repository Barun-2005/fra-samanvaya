const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById } = require('../controllers/userController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

router.get('/', requireAuth, requireRole(['Admin', 'SuperAdmin']), getAllUsers);
router.get('/:id', requireAuth, requireRole(['Admin', 'SuperAdmin']), getUserById);

module.exports = router;
