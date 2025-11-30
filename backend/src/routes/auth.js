const express = require('express');
const router = express.Router();
const {
  register,
  login,
  verify2FA,
  setupTOTP,
  logout,
} = require('../controllers/authController');
const { requireAuth } = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/setup-2fa', requireAuth, setupTOTP);
router.post('/verify-2fa', verify2FA);

module.exports = router;
