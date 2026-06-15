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

module.exports = {
    createGroup
};