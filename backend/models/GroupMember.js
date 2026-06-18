const { GROUP_ROLES, GROUP_ROLE_VALUES } = require('../constants/groupRoles')
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
            enum: GROUP_ROLE_VALUES,
            default: GROUP_ROLES.MEMBER,
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