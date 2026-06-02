const mongoose = require('mongoose');

const dishReviewSchema = new mongoose.Schema({
    
}, {timestamps: true }); // createdAt, updatedAt fields

module.exports = mongoose.model('DishReview', dishReviewSchema);