// Add Mongoose models + other imports here
const RestaurantReview = require('../models/RestaurantReview');
const restaurantReviewService = require('../services/restaurantReviewService');
const mongoose = require('mongoose');

module.exports = {
    /**
     * createRestaurantReview
     * Creates a new restaurant review
     */
    createRestaurantReview: async (req, res) => {
        // Start session for transaction (as we're creating restaurantReview + restaurantReviewEntry together)
        const session = await mongoose.startSession();

        try {
            // Start transaction
            session.startTransaction();

            // Extract data from req body
            const {
                locationId, 
                groupId = null, 
                userRating, 
                images = [],
                tagIds = []
            } = req.body;

            // Create restaurant review doc
            const result = await restaurantReviewService.createRestaurantReviewWithFirstEntry({
                userId: req.userId,
                locationId,
                groupId,
                userRating,
                images,
                tagIds,
                session
            });

            // Commit transaction
            await session.commitTransaction();

            // Return success response
            return res.status(201).json(result);
        } catch (err) {
            // If error, abort transaction and return error response
            await session.abortTransaction();
            console.error(err);

            // Duplicate key error (review already exists for this user/group and location)
             if (err.code === 11000) {
                return res.status(409).json({
                    error: 'Restaurant review already exists for this user/group and location'
                });
            }

            // Validation error (e.g. invalid rating value, invalid locationId/groupId, etc.)
            if (err.statusCode) {
                return res.status(err.statusCode).json({ error: err.message });
            }

            // Mongoose validation error (e.g. from schema validation)
            if (err.name === 'ValidationError') {
                return res.status(400).json({ error: err.message });
            }

            // Catch-all for all other errors
            return res.status(500).json({
                error: 'Failed to create restaurant review'
            });
        } finally {
            // End session
            session.endSession();
        }
    },
    /**
     * getRestaurantReviewById
     * Retrieves a restaurant review by its ID, including all related entries
     */
    getRestaurantReviewById: async (req, res) => {
        try {
            // Extract restaurantReviewId from req params
            const { id } = req.params;

            // Call service function to get restaurant review by ID, along with its entries
            const result = await restaurantReviewService.getRestaurantReviewById({
                restaurantReviewId: id,
                userId: req.userId
            });

            return res.status(200).json(result);
        } catch (err) {
            // Log error for debugging
            console.error(err);

            // If error has statusCode, it's a custom error thrown in service layer (e.g. 404 not found, 403 forbidden, etc.)
            if (err.statusCode) {
                return res.status(err.statusCode).json({ error: err.message });
            }

            // Mongoose validation error (e.g. invalid restaurantReviewId format)
            if (err.name === 'ValidationError') {
                return res.status(400).json({ error: err.message });
            }

            // Catch-all for all other errors
            return res.status(500).json({
                error: 'Failed to get restaurant review'
            });
        }
    },
    updateRestaurantReview: async (req, res) => {},
    deleteRestaurantReview: async (req, res) => {}
}