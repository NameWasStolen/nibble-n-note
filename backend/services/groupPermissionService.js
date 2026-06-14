const GroupMember = require('../models/GroupMember');
const { createHttpError } = require('../utils/errorUtils');

/**
 * requireGroupMember
 * Checks if a user is a member of a group. If not, throws an error. If yes, returns the membership document.
 */
async function requireGroupMember({ groupId, userId, session = null }) {
    // Find if user is a member of the group
    const membership = await GroupMember.findOne({ groupId, userId }).session(session);

    // If not a member, throw error
    if (!membership) {
        throw createHttpError('You are not a member of this group', 403);
    }

    // Return membership document (contains role, join date, etc)
    return membership;
}

/**
 * requireGroupRole
 * Checks if a user has a specific role in a group. If not, throws an error. If yes, returns the membership document.
 */
async function requireGroupRole({ groupId, userId, allowedRoles = [], session = null }) {
    // Check if user is member of group
    const membership = await requireGroupMember({ groupId, userId, session });

    // Check if user's role is in allowedRoles
    if (!allowedRoles.includes(membership.role)) {
        throw createHttpError('You do not have permission to perform this action', 403);
    }

    return membership;
}

module.exports = {
    requireGroupMember,
    requireGroupRole
};