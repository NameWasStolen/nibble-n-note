const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
    {
        foodRating: {
            type: Number,
            required: true,
            min: 0,
            max: 10
        },
        valueRating: {
            type: Number,
            required: true,
            min: 0,
            max: 10
        },
        overallRating: {
            type: Number,
            required: true,
            min: 0,
            max: 10
        },
        comment: {
            type: String,
            default: '',
            trim: true,
            maxlength: 1000 // Reasonable max comment length
        }
    },
    { _id: false }
);

module.exports = ratingSchema;