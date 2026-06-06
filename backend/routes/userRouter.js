const express = require('express');
const userController = require('../controllers/userController.js');

// Create router
const router = express.Router();

// Setting routes
// GET /api/user/me
router.get('/me', authMiddleware, userController.getCurrentUser);

module.exports = router;