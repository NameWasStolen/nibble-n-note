const express = require('express');
const authController = require('../controllers/authController.js');

// Create router
const router = express.Router();

// Setting routes
// POST /api/auth/googleLogin
router.post('/googleLogin', authController.googleLogin);

module.exports = router;