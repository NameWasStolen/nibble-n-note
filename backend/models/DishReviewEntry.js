const mongoose = require('mongoose');

const dishReviewEntrySchema = new mongoose.Schema({
    
}, {timestamps: true }); // createdAt, updatedAt fields

module.exports = mongoose.model('DishReviewEntry', dishReviewEntrySchema);