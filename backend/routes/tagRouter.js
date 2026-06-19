const express = require('express');
const tagController = require('../controllers/tagController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

// Create router
const router = express.Router();

// Setting routes
// POST /api/tags
router.post('/', authMiddleware, tagController.createTag);
// GET /api/tags
router.get('/', authMiddleware, tagController.getTags);
// PATCH /api/tags/:id
// DELETE /api/tags/:id


module.exports = router;