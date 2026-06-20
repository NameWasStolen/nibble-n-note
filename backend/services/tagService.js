const Tag = require('../models/Tag');
const Group = require('../models/Group');
const { validateObjectId } = require('../utils/validators');
const { createHttpError } = require('../utils/errorUtils');
const { GROUP_ROLE_PERMISSIONS } = require('../constants/groupRoles');
const { TAG_CATEGORY_VALUES } = require('../constants/tagCategory');
const { requireGroupMember, requireGroupRole } = require('./groupPermissionService');
const RestaurantReview = require('../models/RestaurantReview');

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

/**
 * getTags
 * Gets personal or group tags accessible to the current user.
 */
async function getTags({
    userId,
    groupId = null,
    category
}) {
    // Validate user
    validateObjectId(userId, 'userId');

    // Validate category if provided
    if (category !== undefined && category !== null) {
        if (!TAG_CATEGORY_VALUES.includes(category)) {
            throw createHttpError('Invalid tag category', 400);
        }
    }

    // Prepare query for db search
    const isGroupTagQuery = !!groupId;
    const query = {};

    // Add groupId and userId values to query for group / personal tag search
    if (isGroupTagQuery) {
        // Confirm groupId is valid
        validateObjectId(groupId, 'groupId');

        // Find if groupId exists
        const group = await Group.findById(groupId);
        if (!group) {
            throw createHttpError('Group not found', 404);
        }

        // Any group member can view/use group tags
        await requireGroupMember({
            groupId,
            userId
        });

        query.groupId = groupId;
        query.userId = null;
    } else {
        // Personal tag query: only return tags owned by the current user
        query.userId = userId;
        query.groupId = null;
    }

    // If category was specified as param, add to query
    if (category !== undefined && category !== null) {
        query.category = category;
    }

    // Use query to find valid tags that match criteria
    const tags = await Tag.find(query)
        .sort({ category: 1, normalisedName: 1 });

    return {
        tags
    };
}

/**
 * updateTag
 * Updates a personal or group tag.
 */
async function updateTag({
    tagId,
    userId,
    name,
    colour,
    category,
    session = null
}) {
    // Validate IDs
    validateObjectId(tagId, 'tagId');
    validateObjectId(userId, 'userId');

    // Require at least one update field
    if (
        name === undefined &&
        colour === undefined &&
        category === undefined
    ) {
        throw createHttpError('At least one of name, colour, or category is required', 400);
    }

    // Validate name if provided
    if (name !== undefined) {
        if (typeof name !== 'string' || name.trim().length === 0) {
            throw createHttpError('Tag name is required', 400);
        }
    }

    // Validate category if provided
    if (category !== undefined) {
        if (!category) {
            throw createHttpError('Tag category is required', 400);
        }
        if (!TAG_CATEGORY_VALUES.includes(category)) {
            throw createHttpError('Invalid tag category', 400);
        }
    }

    // Find tag
    const tag = await Tag.findById(tagId).session(session);
    if (!tag) {
        throw createHttpError('Tag not found', 404);
    }

    // Permission check
    if (tag.groupId) {
        // Group tag: only Owner/Admin can update
        await requireGroupRole({
            groupId: tag.groupId,
            userId,
            allowedRoles: GROUP_ROLE_PERMISSIONS.CAN_MANAGE_TAGS,
            session
        });
    } else {
        // Personal tag: only owner can update
        const isOwner = tag.userId.toString() === userId.toString();
        if (!isOwner) {
            throw createHttpError('You do not have permission to update this tag', 403);
        }
    }

    // Apply updates
    if (name !== undefined) {
        tag.name = name.trim();
    }

    if (colour !== undefined) {
        tag.colour = colour;
    }

    if (category !== undefined) {
        tag.category = category;
    }

    await tag.save({ session });

    return {
        tag
    };
}

/**
 * deleteTag
 * Deletes a personal or group tag.
 */
async function deleteTag({
    tagId,
    userId,
    session = null
}) {
    // Validate IDs
    validateObjectId(tagId, 'tagId');
    validateObjectId(userId, 'userId');

    // Find tag
    const tag = await Tag.findById(tagId).session(session);
    if (!tag) {
        throw createHttpError('Tag not found', 404);
    }

    // Permission check
    if (tag.groupId) {
        // Group tag: only Owner/Admin can delete
        await requireGroupRole({
            groupId: tag.groupId,
            userId,
            allowedRoles: GROUP_ROLE_PERMISSIONS.CAN_DELETE_TAGS,
            session
        });
    } else {
        // Personal tag: only owner can delete
        const isOwner = tag.userId.toString() === userId.toString();
        if (!isOwner) {
            throw createHttpError('You do not have permission to delete this tag', 403);
        }
    }

    // Remove tag from restaurant reviews that reference it
    await RestaurantReview.updateMany(
        { tagIds: tag._id },
        { $pull: { tagIds: tag._id } },
        { session }
    );

    // TODO: Remove tag from dish reviews that reference it (when dishes are implemented)

    // Delete tag
    await Tag.deleteOne({
        _id: tag._id
    }).session(session);

    return {
        deletedTagId: tag._id
    };
}

module.exports = {
    createTag,
    getTags,
    updateTag,
    deleteTag
};