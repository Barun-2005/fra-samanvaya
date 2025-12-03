const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Public chat endpoint - no auth required for testing
router.post('/', chatController.chatWithAgent);

module.exports = router;
