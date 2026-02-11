const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    creatorId: { // User who created the group. Uses _id from User collection
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    memberList: {
        type: [mongoose.Schema.Types.ObjectId], // Array of User _id's
        ref: 'User',
        default: function() { // Use function so creatorId can be accessed
            return this.creatorId ? [this.creatorId] : []; 
        } 
    }
}, { timestamps: true }); // createdAt, updatedAt

module.exports = mongoose.model('Group', groupSchema);