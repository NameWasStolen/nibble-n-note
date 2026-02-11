const mongoose = require('mongoose');

const restaurantReviewSchema = new mongoose.Schema({
    creatorType: {
        type: String,
        enum: ['User', 'Group'],
        required: true
    },
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'creatorType'
    },
    locationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        required: true
    },
    foodRating: {
        type: Number,
        min: 0,
        max: 10,
        required: true
    },
    valueRating: {
        type: Number,
        min: 0,
        max: 10,
        required: true
    },
    overallRating: {
        type: Number,
        min: 0,
        max: 10,
        required: true
    },
    comments: {
        type: String,
        default: ''
    },
    images: {
        type: [String], // Array of image URLs
        default: []
    }
}, {timestamps: true }); // createdAt, updatedAt fields

module.exports = mongoose.model('RestaurantReview', restaurantReviewSchema);