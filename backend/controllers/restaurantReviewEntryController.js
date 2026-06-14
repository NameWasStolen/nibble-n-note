// Add Mongoose models + other imports here
const RestaurantReview = require('../models/RestaurantReview');
const RestaurantReviewEntry = require('../models/RestaurantReviewEntry');
const restaurantReviewService = require('../services/restaurantReviewService');
const mongoose = require('mongoose');

module.exports = {
    createRestaurantReviewEntry: async (req, res) => {
        const session = await mongoose.startSession();

        try {
            // Start session for transaction (creating entry + updating consensus rating if entry_average set)
            session.startTransaction();

            // Extract data from req body
            const {
                restaurantReviewId,
                userRating,
                images = []
            } = req.body;

            // Create restaurant review entry
            const result = await restaurantReviewService.createRestaurantReviewEntry({
                userId: req.userId,
                restaurantReviewId,
                userRating,
                images,
                session
            });

            // Commit transaction
            await session.commitTransaction();

            return res.status(201).json(result);
        } catch (err) {
            // If error, abort transaction and return error response
            await session.abortTransaction();
            console.error(err);

            // Dupe key error (user already has an entry for this restaurant review)
            if (err.code === 11000) {
                return res.status(409).json({
                    error: 'You have already added an entry to this restaurant review'
                });
            }

            // Validation error (e.g. invalid rating value, invalid restaurantReviewId, etc.)
            if (err.statusCode) {
                return res.status(err.statusCode).json({ error: err.message });
            }

            // Mongoose validation error
            if (err.name === 'ValidationError') {
                return res.status(400).json({ error: err.message });
            }

            // Catch-all for other errors
            return res.status(500).json({
                error: 'Failed to create restaurant review entry'
            });
        } finally {
            // End session
            session.endSession();
        }
    }
}