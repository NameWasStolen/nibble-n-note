// Imports
const RestaurantReview = require('../models/RestaurantReview');
const RestaurantReviewEntry = require('../models/RestaurantReviewEntry');
const Location = require('../models/Location');
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

module.exports = {
    createRestaurantReviewWithFirstEntry
};