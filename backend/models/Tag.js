const mongoose = require('mongoose');
const { TAG_CATEGORY_VALUES } = require('../constants/tagCategory');

const tagSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group',
            default: null
        },
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50
        },
        normalisedName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            maxlength: 50
        },
        colour: {
            type: String,
            trim: true,
            default: null,
            set: function (value) {
                // Ensure values are the trimmed string or null
                if (value === undefined || value === null) {
                    return null;
                }

                if (typeof value !== 'string') {
                    return value;
                }

                const trimmedValue = value.trim();

                return trimmedValue.length === 0 ? null : trimmedValue;
            },
            validate: {
                validator: function (value) {
                    // Allow optional colour
                    if (value === null || value === undefined) {
                        return true;
                    }
         
                    if (typeof value !== 'string') {
                        return false;
                    }

                    // Accepts 3-char / 6-char hexcode, with required leading #
                    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
                },
                message: 'Tag colour must be a valid hex colour'
            }
        },
        category: {
            type: String,
            enum: TAG_CATEGORY_VALUES,
            required: true
        }
    },
    { timestamps: true }
);

// Mongoose middleware validator
tagSchema.pre('validate', function () {
    /* Ensure that exactly one of userId or groupId is set */
    // Convert user + group vals into boolean
    const hasUser = !!this.userId;
    const hasGroup = !!this.groupId;

    // Only ONE of userId or groupId should be set, to ensure distinction between user and group tags
    // Return error if both are set or both are not set
    if (hasUser === hasGroup) {
        throw new Error('Tag must belong to exactly one of userId or groupId');
    }

    /* Generate normalised name from name */
    if (this.name) {
        this.normalisedName = this.name.trim().toLowerCase();
    }
});

// Prevent duplicate personal tags
tagSchema.index(
    { userId: 1, category: 1, normalisedName: 1 },
    { unique: true, partialFilterExpression: { userId: { $type: 'objectId' } } } // Make sure index only applied to docs w/userId set (ensures null userId tags not considered duplicates of each other)
);

// Prevent duplicate group tags
tagSchema.index(
    { groupId: 1, category: 1, normalisedName: 1 },
    { unique: true, partialFilterExpression: { groupId: { $type: 'objectId' } } } // Make sure index only applied to docs w/groupId set
);

module.exports = mongoose.model('Tag', tagSchema);