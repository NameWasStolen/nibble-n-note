const mongoose = require('mongoose');
const ratingSchema = require('./subschemas/ratingSchema');

const dishReviewEntrySchema = new mongoose.Schema(
    {
        dishReviewId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DishReview',
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

// One user can only have one entry per dish review
dishReviewEntrySchema.index(
    { dishReviewId: 1, userId: 1 },
    { unique: true }
);

module.exports = mongoose.model('DishReviewEntry', dishReviewEntrySchema);