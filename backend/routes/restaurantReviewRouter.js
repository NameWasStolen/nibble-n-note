const express = require('express');
const restaurantReviewController = require('../controllers/restaurantReviewController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

// Create router
const router = express.Router();

// Setting routes
// POST /api/restaurant-reviews/
router.post('/', authMiddleware, restaurantReviewController.createRestaurantReview);
// GET /api/restaurant-reviews/
router.get('/', authMiddleware, restaurantReviewController.getRestaurantReviews);
// GET /api/restaurant-reviews/:id
router.get('/:id', authMiddleware, restaurantReviewController.getRestaurantReviewById);
// PATCH /api/restaurant-reviews/:id
router.patch('/:id', authMiddleware, restaurantReviewController.updateRestaurantReview);
// DELETE /api/restaurant-reviews/:id
router.delete('/:id', authMiddleware, restaurantReviewController.deleteRestaurantReview);
// GET /api/restaurant-reviews/suggestions`

module.exports = router;