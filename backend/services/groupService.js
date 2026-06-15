// Imports
const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const { createHttpError } = require('../utils/errorUtils');
const { validateObjectId } = require('../utils/validators');

/**
 * createGroup
 * Creates a group and adds the creator as the Owner member.
 */
async function createGroup({ userId, name, session = null }) {
    // Validate inputs
    validateObjectId(userId, 'userId');
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        throw createHttpError('Group name is required', 400);
    }

    // Create Group in db
    const groupDocs = await Group.create(
        [
            {
                name: name.trim(),
                creatorId: userId
            }
        ],
        { session }
    );
    const group = groupDocs[0];

    // Create first group member (group owner)
    const groupMemberDocs = await GroupMember.create(
        [
            {
                groupId: group._id,
                userId,
                role: 'owner',
                invitedBy: null
            }
        ],
        { session }
    );
    const groupMember = groupMemberDocs[0];

    return {
        group,
        groupMember
    };
}

/**
 * getUserGroups
 * Gets all groups that the current user is a member of.
 */
async function getUserGroups({ userId }) {
    // Validate userId
    validateObjectId(userId, 'userId');

    // Find all GroupMember records involving this user
    const memberships = await GroupMember.find({ userId })
        .populate('groupId', 'name creatorId createdAt updatedAt')
        .sort({ joinedAt: -1 });

    // Create array containing info about each group + membership
    const groups = memberships.map((membership) => (
        {
            membership: {
                _id: membership._id,
                role: membership.role,
                joinedAt: membership.joinedAt
            },
            group: membership.groupId
        }))

    return { groups };
}

module.exports = {
    createGroup
};