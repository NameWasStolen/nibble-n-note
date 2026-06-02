const mongoose = require('mongoose');

const restaurantReviewEntrySchema = new mongoose.Schema({
    
}, {timestamps: true }); // createdAt, updatedAt fields

module.exports = mongoose.model('RestaurantReviewEntry', restaurantReviewEntrySchema);