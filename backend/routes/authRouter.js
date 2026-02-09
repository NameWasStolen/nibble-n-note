const express = require('express');
const authController = require('../controllers/authController.js');

// Create router
const router = express.Router();

// Setting routes
// POST /auth/google
router.post('/google', authController.googleLogin);

module.exports = router;