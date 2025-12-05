const express = require('express');
const router = express.Router();
const vidhiController = require('../controllers/vidhiController');
const { requireAuth } = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(requireAuth);

router.post('/draft-order', vidhiController.draftOrder);
router.get('/precedents', vidhiController.searchPrecedents);
router.get('/laws', vidhiController.fetchLaws);

module.exports = router;
