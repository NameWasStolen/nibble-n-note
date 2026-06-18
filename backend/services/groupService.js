// Imports
const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const { createHttpError } = require('../utils/errorUtils');
const { validateObjectId } = require('../utils/validators');
const { requireGroupRole, requireGroupMember } = require('./groupPermissionService');
const { GROUP_ROLES, GROUP_ROLE_VALUES, GROUP_ROLE_PERMISSIONS } = require('../constants/groupRoles');

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
                role: GROUP_ROLES.OWNER,
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

/**
 * getGroupById
 * Gets one group by ID if the current user is a member.
 */
async function getGroupById({ groupId, userId }) {
    // Validations
    validateObjectId(groupId, 'groupId');
    validateObjectId(userId, 'userId');

    // Find group by groupId
    const group = await Group.findById(groupId)
        .populate('creatorId', 'name email');
    if (!group) {
        throw createHttpError('Group not found', 404);
    }

    // Confirm user has permission to view group (member has to be in this group to view)
    const membership = await GroupMember.findOne({
        groupId,
        userId
    });
    if (!membership) {
        throw createHttpError('You do not have permission to view this group', 403);
    }

    return {
        group,
        currentUserMembership: membership
    };
}

/**
 * updateGroup
 * Updates group-level fields.
 */
async function updateGroup({
    groupId,
    userId,
    name
}) {
    // Validate IDs
    validateObjectId(groupId, 'groupId');
    validateObjectId(userId, 'userId');

    // Require at least one update field
    if (name === undefined) {
        throw createHttpError('At least one update field is required', 400);
    }

    // Validate name if provided
    if (typeof name !== 'string' || name.trim().length === 0) {
        throw createHttpError('Group name is required', 400);
    }

    // Find group
    const group = await Group.findById(groupId);
    if (!group) {
        throw createHttpError('Group not found', 404);
    }

    // Only Owner/Admin can update group
    await requireGroupRole({
        groupId,
        userId,
        allowedRoles: GROUP_ROLE_PERMISSIONS.CAN_MANAGE_GROUP
    });

    // Apply updates
    group.name = name.trim();

    await group.save();

    return { group };
}

/**
 * deleteGroup
 * Deletes a group and its linked group members.
 */
async function deleteGroup({
    groupId,
    userId,
    session = null
}) {
    // Validate IDs
    validateObjectId(groupId, 'groupId');
    validateObjectId(userId, 'userId');

    // Find group
    const group = await Group.findById(groupId).session(session);
    if (!group) {
        throw createHttpError('Group not found', 404);
    }

    // Only Owner can delete group
    await requireGroupRole({
        groupId,
        userId,
        allowedRoles: GROUP_ROLE_PERMISSIONS.CAN_DELETE_GROUP,
        session
    });

    // Delete group members first
    await GroupMember.deleteMany({
        groupId: group._id
    }).session(session);

    // Delete group
    await Group.deleteOne({
        _id: group._id
    }).session(session);

    return {
        deletedGroupId: group._id
    };
}

/**
 * addGroupMember
 * Adds a user to a group.
 */
async function addGroupMember({
    groupId,
    senderUserId,
    receiverUserId,
    role = GROUP_ROLES.MEMBER,
    session = null
}) {
    // Validate IDs
    validateObjectId(groupId, 'groupId');
    validateObjectId(senderUserId, 'senderUserId');
    validateObjectId(receiverUserId, 'receiverUserId');

    // Validate role
    if (!GROUP_ROLE_VALUES.includes(role)) {
        throw createHttpError('Invalid group member role', 400);
    }

    // Find group
    const group = await Group.findById(groupId).session(session);
    if (!group) {
        throw createHttpError('Group not found', 404);
    }

    // Only Owner/Admin can add members
    await requireGroupRole({
        groupId,
        userId: senderUserId,
        allowedRoles: GROUP_ROLE_PERMISSIONS.CAN_MANAGE_MEMBERS,
        session
    });

    // Optional MVP rule: do not allow adding another Owner
    if (role === GROUP_ROLES.OWNER) {
        throw createHttpError('Cannot add a new member as Owner', 400);
    }

    // Create group member
    const groupMemberDocs = await GroupMember.create(
        [
            {
                groupId,
                userId: receiverUserId,
                role,
                invitedBy: senderUserId
            }
        ],
        { session }
    );

    const groupMember = groupMemberDocs[0];

    return {
        groupMember
    };
}

/**
 * getGroupMembers
 * Gets all members of a group if the current user is a member.
 */
async function getGroupMembers({ groupId, userId }) {
    // Validate IDs
    validateObjectId(groupId, 'groupId');
    validateObjectId(userId, 'userId');

    // Confirm group exists
    const group = await Group.findById(groupId);
    if (!group) {
        throw createHttpError('Group not found', 404);
    }

    // Current user must be a member to view members
    await requireGroupMember({
        groupId,
        userId
    });

    // Get all group members
    const members = await GroupMember.find({ groupId })
        .populate('userId', 'name email')
        .populate('invitedBy', 'name email')
        .sort({ role: 1, joinedAt: 1 }); // Sort ascending by role, then time they joined

    return {
        group,
        members
    };
}

module.exports = {
    createGroup, 
    getUserGroups, 
    getGroupById,
    updateGroup, 
    deleteGroup, 
    addGroupMember, 
    getGroupMembers
};