const mongoose = require('mongoose');

const groupMemberSchema = new mongoose.Schema(
    {
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group',
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['Owner', 'Admin', 'Member'],
            default: 'Member',
            required: true
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        invitedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        }
    },
    { timestamps: true }
);

// Prevent same user being added to the same group multiple times
groupMemberSchema.index(
    { groupId: 1, userId: 1 },
    { unique: true }
);

module.exports = mongoose.model('GroupMember', groupMemberSchema);