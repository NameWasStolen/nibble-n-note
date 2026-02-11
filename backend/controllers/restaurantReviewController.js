const RestaurantReview = require('../models/RestaurantReview');
const User = require('../models/User');
const Group = require('../models/Group');
const { createOrUpdateLocation } = require('../services/locationService');

module.exports = {
    createReview: async (req, res) => {
        try {
            // Retrieve data from request body
            const { 
                placeId, name, address, businessStatus, price, lat, lng, // For location creation/update
                creatorType, creatorId, foodRating, valueRating, overallRating, comments, images // For review
             } = req.body;

            // Validate required fields for location
            if (!placeId || !name || !address || lat === undefined || lng === undefined) {
                return res.status(400).json({ error: 'Missing required fields for location' });
            }

            // Create or update location
            const location = await createOrUpdateLocation({ placeId, name, address, businessStatus, price, lat, lng });

            // Validate creatorType for restaurant review
            if (creatorType !== 'User' && creatorType !== 'Group') {
                return res.status(400).json({ error: 'Invalid creatorType. Must be "User" or "Group".' });
            }
            
            // Validate creatorId exists in correct collection
            let creatorExists;
            if (creatorType === 'User') {
                creatorExists = await User.exists({ _id: creatorId });
            } else if (creatorType === 'Group') {
                creatorExists = await Group.exists({ _id: creatorId });
            }

            if (!creatorExists) {
                return res.status(400).json({ error: `creatorId does not exist for type ${creatorType}` });
            }

            // Validate that ratings are numbers between 0-10
            const ratings = { foodRating, valueRating, overallRating };
            for (const [key, value] of Object.entries(ratings)) {
                if (typeof value !== 'number' || value < 0 || value > 10) {
                    return res.status(400).json({ error: `${key} must be a number between 0 and 10` });
                }
            }

            // Check if a review already exists for this creator + location
            const existingReview = await RestaurantReview.findOne({
                creatorType,
                creatorId,
                locationId: location._id
            });

            if (existingReview) {
                return res.status(400).json({ 
                    error: 'A review already exists for this creator at this location' 
                });
            }

            // Create review item with reference to location
            const review = new RestaurantReview({
                creatorType,
                creatorId,
                locationId: location._id,
                foodRating,
                valueRating,
                overallRating,
                comments: comments || '',
                images: images || []
            });

            await review.save();

            res.status(201).json(review);
        } catch (err) {
            if (err.name === 'ValidationError') {
                return res.status(400).json({ error: 'Validation error', details: err.message });
            }

            res.status(500).json({ error: err.message });
        }
    }
}