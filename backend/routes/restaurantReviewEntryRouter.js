const express = require('express');
const restaurantReviewEntryController = require('../controllers/restaurantReviewEntryController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

// Create router
const router = express.Router();

// Setting routes
// POST /api/restaurant-review-entries/
router.post('/', authMiddleware, restaurantReviewEntryController.createRestaurantReviewEntry);
// PATCH /api/restaurant-review-entries/:id TODO
// DELETE /api/restaurant-review-entries/:id TODO

module.exports = router;