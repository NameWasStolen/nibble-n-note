const mongoose = require('mongoose');
const ratingSchema = require('./subschemas/ratingSchema');

const restaurantReviewSchema = new mongoose.Schema(
    {
        locationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Location',
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group',
            default: null
        },
        consensusRating: {
            type: ratingSchema,
            required: true
        },
        tagIds: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Tag'
                }
            ],
            default: []
        },
        createdByUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    { timestamps: true }
);

// Mongoose middleware validator
restaurantReviewSchema.pre('validate', function (next) {
    /* Ensure exactly one of userId or groupId is set */
    // Convert user + group vals into boolean
    const hasUser = !!this.userId;
    const hasGroup = !!this.groupId;

    // Only ONE of userId or groupId should be set, to ensure distinction between personal and group restaurant reviews
    if (hasUser === hasGroup) {
        return next(new Error('RestaurantReview must belong to exactly one of userId or groupId'));
    }

    next();
});

// One personal restaurant review per user per location
restaurantReviewSchema.index(
    { userId: 1, locationId: 1 },
    { unique: true, partialFilterExpression: { userId: { $type: 'objectId' } } } // Make sure index only applied to docs w/userId set (ensures null userId reviews not considered duplicates of each other)
);

// One group restaurant review per group per location
restaurantReviewSchema.index(
    { groupId: 1, locationId: 1 },
    { unique: true, partialFilterExpression: { groupId: { $type: 'objectId' } } } // Make sure index only applied to docs w/groupId set
);

module.exports = mongoose.model('RestaurantReview', restaurantReviewSchema);