const express = require('express');
const locationController = require('../controllers/locationController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

// Create router
const router = express.Router();

// Setting routes
// POST /api/location/
router.post('/', authMiddleware, locationController.findOrCreateLocation);

module.exports = router;