const mongoose = require('mongoose');

// Helper private validation function to create error messages for invalid inputs
function createValidationError(message, statusCode = 400) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

// Validates that a given ID is a valid MongoDB ObjectId
function validateObjectId(id, fieldName = 'id') {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw createValidationError(`Invalid ${fieldName}`);
    }
}

// Validates that a given ID is either null/undefined/empty or a valid MongoDB ObjectId
function validateOptionalObjectId(id, fieldName = 'id') {
    if (id === undefined || id === null || id === '') {
        return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw createValidationError(`Invalid ${fieldName}`);
    }
}

// Validates that a given value is an array of valid MongoDB ObjectIds (e.g. tagIds)
function validateObjectIdArray(ids, fieldName = 'ids') {
    if (!Array.isArray(ids)) {
        throw createValidationError(`${fieldName} must be an array`);
    }

    for (const id of ids) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw createValidationError(`Invalid ${fieldName} item`);
        }
    }
}

// Validates that the rating input is a valid object (not null or an array)
function validateRatingInput(rating, fieldName = 'userRating') {
    if (!rating || typeof rating !== 'object' || Array.isArray(rating)) {
        throw createValidationError(`${fieldName} is required`);
    }
}

// Validates that a given value is an array (used for validating images input)
function validateArray(value, fieldName = 'field') {
    if (!Array.isArray(value)) {
        throw createValidationError(`${fieldName} must be an array`);
    }
}

module.exports = {
    createValidationError,
    validateObjectId,
    validateOptionalObjectId,
    validateObjectIdArray,
    validateRatingInput,
    validateArray
};