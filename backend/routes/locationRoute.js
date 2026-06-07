const express = require('express');
const locationController = require('../controllers/locationController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

// Create router
const router = express.Router();

// Setting routes
// GET /api/locations/:id
router.get('/:id', authMiddleware, locationController.getLocationById);

// POST /api/locations/
router.post('/', authMiddleware, locationController.findOrCreateLocation);

module.exports = router;