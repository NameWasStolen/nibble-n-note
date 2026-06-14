// Imports
const RestaurantReview = require('../models/RestaurantReview');
const RestaurantReviewEntry = require('../models/RestaurantReviewEntry');
const Location = require('../models/Location');
const Tag = require('../models/Tag');
const { validateObjectId, validateRatingInput, validateObjectIdArray, validateArray } = require('../utils/validators');
const { getAvgRating } = require('../utils/ratingUtils');
const { createHttpError } = require('../utils/errorUtils');
const { requireGroupMember } = require('./groupPermissionService');
/**
 * createRestaurantReviewWithFirstEntry
 * Creates a restaurant review with a first entry
 */
async function createRestaurantReviewWithFirstEntry({
    userId,
    locationId,
    groupId = null,
    userRating,
    images = [],
    tagIds = [],
    session = null
}) {
    // Validate input types and shape
    validateObjectId(userId, 'userId');
    validateObjectId(locationId, 'locationId');
    validateRatingInput(userRating);
    validateObjectIdArray(tagIds, 'tagIds');
    validateArray(images, 'images');

    // If groupId, validate it and check if user is a member of the group
    const isGroupReview = !!groupId;
    if (isGroupReview) {
        validateObjectId(groupId, 'groupId');
        await requireGroupMember({ groupId, userId, session });
    }

    // Confirm location exists
    const location = await Location.findById(locationId).session(session);
    if (!location) {
        throw createHttpError('Location not found', 404);
    }

    // Create restaurant review container, using userRating for initial consensusRating data
    const restaurantReviewDocs = await RestaurantReview.create(
        [
            {
                locationId,
                userId: isGroupReview ? null : userId,
                groupId: isGroupReview ? groupId : null,
                consensusRating: {
                    foodRating: userRating.foodRating,
                    valueRating: userRating.valueRating,
                    overallRating: userRating.overallRating
                },
                consensusSource: 'entry_average',
                consensusUpdatedBy: userId,
                consensusUpdatedAt: new Date(),
                tagIds,
                createdByUserId: userId
            }
        ],
        { session }
    );

    // Create first restaurant review entry linked to the restaurant review container
    const restaurantReview = restaurantReviewDocs[0]; // Get created restaurant review container doc
    const restaurantReviewEntryDocs = await RestaurantReviewEntry.create(
        [
            {
                restaurantReviewId: restaurantReview._id,
                userId,
                userRating,
                images
            }
        ],
        { session }
    );

    const restaurantReviewEntry = restaurantReviewEntryDocs[0];

    return { restaurantReview, restaurantReviewEntry };
}

/**
 * getRestaurantReviewById
 * Gets a restaurant review container by ID, along with its entries.
 */
async function getRestaurantReviewById({ restaurantReviewId, userId }) {
    // Validate IDs
    validateObjectId(restaurantReviewId, 'restaurantReviewId');
    validateObjectId(userId, 'userId');

    // Find restaurant review container
    const restaurantReview = await RestaurantReview.findById(restaurantReviewId)
        .populate('locationId', 'name address placeId price businessStatus coord')
        .populate('tagIds', 'userId groupId name colour category');

    // If not found, throw 404
    if (!restaurantReview) {
        throw createHttpError('Restaurant review not found', 404);
    }

    // Access control: Check if user is owner or group member (if group review)
    if (restaurantReview.groupId) {
        await requireGroupMember({
            groupId: restaurantReview.groupId,
            userId
        });
    } else {
        const isOwner = restaurantReview.userId.toString() === userId.toString();

        if (!isOwner) {
            throw createHttpError('You do not have permission to view this restaurant review', 403);
        }
    }

    // Get entries for this restaurant review
    const entries = await RestaurantReviewEntry.find({
        restaurantReviewId: restaurantReview._id
    }).populate('userId', 'name email');

    return {
        restaurantReview,
        entries
    };
}

/**
 * recalcRestaurantReviewConsensus
 * Recalculates consensus rating from all entries if consensus source is entry_average.
 */
async function recalcRestaurantReviewConsensus({ restaurantReview, updatedByUserId, session = null }) {
    // Confirm consensus source is entry_average before recalculating, otherwise skip
    if (restaurantReview.consensusSource !== 'entry_average') {
        return restaurantReview;
    }

    // Get all entries relating to restaurant review
    const entries = await RestaurantReviewEntry.find({
        restaurantReviewId: restaurantReview._id
    }).session(session);

    // Get average consensus rating from entries
    const averageConsensusRating = getAvgRating(entries);

    // If no entries, skip updating consensus rating
    if (!averageConsensusRating) {
        return restaurantReview;
    }

    // Update restaurant review consensus rating and updatedBy/updatedAt fields
    restaurantReview.consensusRating = averageConsensusRating;
    restaurantReview.consensusUpdatedBy = updatedByUserId;
    restaurantReview.consensusUpdatedAt = new Date();

    // Save updated restaurant review in session if provided
    await restaurantReview.save({ session });

    return restaurantReview;
}

/**
 * createRestaurantReviewEntry
 * Adds a user's entry to an existing restaurant review container.
 */
async function createRestaurantReviewEntry({
    userId,
    restaurantReviewId,
    userRating,
    images = [],
    session = null
}) {
    // Validate input types and shape
    validateObjectId(userId, 'userId');
    validateObjectId(restaurantReviewId, 'restaurantReviewId');
    validateRatingInput(userRating);
    validateArray(images, 'images');

    // Find restaurant review container
    const restaurantReview = await RestaurantReview.findById(restaurantReviewId).session(session);
    if (!restaurantReview) {
        throw createHttpError('Restaurant review not found', 404);
    }

    // Access control: user must own personal review, or be member of group review
    if (restaurantReview.groupId) {
        await requireGroupMember({
            groupId: restaurantReview.groupId,
            userId,
            session
        });
    } else {
        const isOwner = restaurantReview.userId.toString() === userId.toString();

        if (!isOwner) {
            throw createHttpError('You do not have permission to add an entry to this restaurant review', 403);
        }
    }

    // Create restaurant review entry
    const restaurantReviewEntryDocs = await RestaurantReviewEntry.create(
        [
            {
                restaurantReviewId,
                userId,
                userRating,
                images
            }
        ],
        { session }
    );
    const restaurantReviewEntry = restaurantReviewEntryDocs[0];

    // Recalculate parent consensus rating
    const updatedRestaurantReview = await recalcRestaurantReviewConsensus({
        restaurantReview,
        updatedByUserId: userId,
        session
    });

    return {
        restaurantReview: updatedRestaurantReview,
        restaurantReviewEntry
    };
}

/**
 * updateRestaurantReviewEntry
 * Updates a user's own restaurant review entry.
 */
async function updateRestaurantReviewEntry({
    userId,
    restaurantReviewEntryId,
    userRating,
    images,
    session = null
}) {
    // Validate IDs
    validateObjectId(userId, 'userId');
    validateObjectId(restaurantReviewEntryId, 'restaurantReviewEntryId');

    // Require at least one update field
    if (userRating === undefined && images === undefined) {
        throw createHttpError('At least one of userRating or images is required', 400);
    }

    // Validate optional update fields
    if (userRating !== undefined) {
        validateRatingInput(userRating);
    }
    if (images !== undefined) {
        validateArray(images, 'images');
    }

    // Find entry
    const restaurantReviewEntry = await RestaurantReviewEntry.findById(
        restaurantReviewEntryId
    ).session(session);
    if (!restaurantReviewEntry) {
        throw createHttpError('Restaurant review entry not found', 404);
    }

    // Users can only update their own entry
    const isEntryOwner = restaurantReviewEntry.userId.toString() === userId.toString();
    if (!isEntryOwner) {
        throw createHttpError(
            'You do not have permission to update this restaurant review entry',
            403
        );
    }

    // Find parent restaurant review container
    const restaurantReview = await RestaurantReview.findById(
        restaurantReviewEntry.restaurantReviewId
    ).session(session);
    if (!restaurantReview) {
        throw createHttpError('Parent restaurant review not found', 404);
    }

    // Apply updates
    if (userRating !== undefined) {
        restaurantReviewEntry.userRating = userRating;
    }
    if (images !== undefined) {
        restaurantReviewEntry.images = images;
    }

    // Save entry update
    await restaurantReviewEntry.save({ session });

    // Recalculate parent consensus rating if consensusSource is entry_average
    const updatedRestaurantReview = await recalcRestaurantReviewConsensus({
        restaurantReview,
        updatedByUserId: userId,
        session
    });

    return {
        restaurantReview: updatedRestaurantReview,
        restaurantReviewEntry
    };
}

module.exports = {
    createRestaurantReviewWithFirstEntry,
    getRestaurantReviewById,
    recalcRestaurantReviewConsensus,
    createRestaurantReviewEntry
};