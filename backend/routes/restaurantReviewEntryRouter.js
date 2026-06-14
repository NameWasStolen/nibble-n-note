const express = require('express');
const restaurantReviewEntryController = require('../controllers/restaurantReviewEntryController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

// Create router
const router = express.Router();

// Setting routes
// POST /api/restaurant-review-entries/
router.post('/', authMiddleware, restaurantReviewEntryController.createRestaurantReviewEntry);
// PATCH /api/restaurant-review-entries/:id
router.patch('/:id', authMiddleware, restaurantReviewEntryController.updateRestaurantReviewEntry)
// DELETE /api/restaurant-review-entries/:id
router.delete('/:id', authMiddleware, restaurantReviewEntryController.deleteRestaurantReviewEntry)

module.exports = router;