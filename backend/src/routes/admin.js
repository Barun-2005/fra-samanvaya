const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

// Only SuperAdmin can see anomalies
router.get('/anomalies', requireAuth, requireRole(['Super Admin']), adminController.getSystemAnomalies);

module.exports = router;
