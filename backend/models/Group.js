const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 60, // Max reasonable group name length
    },
    creatorId: { // User who created the group. Uses _id from User collection
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true }); // createdAt, updatedAt

module.exports = mongoose.model('Group', groupSchema);