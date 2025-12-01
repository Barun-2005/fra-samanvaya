const express = require('express');
const router = express.Router();
const { ingestDocument, queryKnowledgeBase } = require('../controllers/knowledgeBaseController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

// Ingest - Only Admins/SuperAdmins should ideally do this, but for now we'll allow authenticated users for testing
router.post('/ingest', requireAuth, requireRole(['SuperAdmin', 'Admin']), ingestDocument);

// Query - Available to all authenticated users (Citizens, Officers)
router.post('/query', requireAuth, queryKnowledgeBase);

module.exports = router;
