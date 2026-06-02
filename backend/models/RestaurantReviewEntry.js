const mongoose = require('mongoose');
const ratingSchema = require('./subschemas/ratingSchema');

const restaurantReviewEntrySchema = new mongoose.Schema(
    {
        restaurantReviewId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'RestaurantReview',
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        userRating: {
            type: ratingSchema,
            required: true
        },
        images: {
            type: [String],
            default: []
        }
    },
    { timestamps: true }
);

// One user can only have one entry per restaurant review
restaurantReviewEntrySchema.index(
    { restaurantReviewId: 1, userId: 1 },
    { unique: true }
);

module.exports = mongoose.model('RestaurantReviewEntry', restaurantReviewEntrySchema);