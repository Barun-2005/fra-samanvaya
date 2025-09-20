const express = require('express');
const router = express.Router();
const { register, login, verify2FA, setupTOTP } = require('../controllers/authController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

router.post('/register', requireAuth, requireRole(['Admin']), register);
router.post('/login', login);
router.post('/2fa/verify', verify2FA);
router.post('/totp/setup', requireAuth, setupTOTP);

module.exports = router;
