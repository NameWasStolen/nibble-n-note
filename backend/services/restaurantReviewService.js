// Imports
const RestaurantReview = require('../models/RestaurantReview');
const RestaurantReviewEntry = require('../models/RestaurantReviewEntry');
const Location = require('../models/Location');
const Tag = require('../models/Tag');
const { validateObjectId, validateRatingInput, validateObjectIdArray, validateArray } = require('../utils/validators');
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
        const error = new Error('Location not found');
        error.statusCode = 404;
        throw error;
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
        const error = new Error('Restaurant review not found');
        error.statusCode = 404;
        throw error;
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
            const error = new Error('You do not have permission to view this restaurant review');
            error.statusCode = 403;
            throw error;
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

module.exports = {
    createRestaurantReviewWithFirstEntry,
    getRestaurantReviewById
};