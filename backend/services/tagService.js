const Tag = require('../models/Tag');
const Group = require('../models/Group');
const { validateObjectId } = require('../utils/validators');
const { createHttpError } = require('../utils/errorUtils');
const { requireGroupRole } = require('./groupPermissionService');
const { GROUP_ROLE_PERMISSIONS } = require('../constants/groupRoles');
const { TAG_CATEGORY_VALUES } = require('../constants/tagCategory');

/**
 * createTag
 * Creates a personal or group tag.
 */
async function createTag({
    userId,
    groupId = null,
    name,
    colour = null,
    category,
    session = null
}) {
    // Validate user (needed in case role needs to be checked for group tag)
    validateObjectId(userId, 'userId');

    // Validate name
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        throw createHttpError('Tag name is required', 400);
    }

    // Validate category
    if (!category) {
        throw createHttpError('Tag category is required', 400);
    }
    if (!TAG_CATEGORY_VALUES.includes(category)) {
        throw createHttpError('Invalid tag category', 400);
    }

    const isGroupTag = !!groupId;

    // If group tag, group must exist and current user must be Owner/Admin
    if (isGroupTag) {
        validateObjectId(groupId, 'groupId');

        // Check that group exists
        const group = await Group.findById(groupId).session(session);
        if (!group) {
            throw createHttpError('Group not found', 404);
        }

        // Check that user is Owner / Admin in the group
        await requireGroupRole({
            groupId,
            userId,
            allowedRoles: GROUP_ROLE_PERMISSIONS.CAN_MANAGE_TAGS,
            session
        });
    }

    // Create Tag
    const tagDocs = await Tag.create(
        [
            {
                userId: isGroupTag ? null : userId,
                groupId: isGroupTag ? groupId : null,
                name: name.trim(),
                colour,
                category
            }
        ],
        { session }
    );

    return {
        tag: tagDocs[0]
    };
}

module.exports = {
    createTag
};