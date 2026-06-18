const mongoose = require('mongoose');
const { BUSINESS_STATUS_VALUES } = require('../constants/businessStatus');

const locationSchema = new mongoose.Schema({
    placeId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true // Added for faster location queries
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    businessStatus: {
        type: String,
        enum: BUSINESS_STATUS_VALUES,
        default: null
    },
    price:{
        type: Number,
        min: 0,
        max: 4
    },
    coord: { // GeoJSON format (object with type, coordinates attributes)
        type: { 
            type: String, 
            enum: ['Point'],
            default: 'Point', 
            required: true
        },
        coordinates: { 
            type: [Number], 
            required: true,
            validate: {
                validator: function(value) {
                    // Check value is array, and length 2
                    if (!Array.isArray(value) || value.length !== 2) return false;

                    const [lng, lat] = value;

                    // Check lng + lat are numbers in valid ranges
                    return (
                        typeof lng === 'number' &&
                        typeof lat === 'number' &&
                        lng >= -180 &&
                        lng <= 180 &&
                        lat >= -90 &&
                        lat <= 90
                    );
                },
                message: 'Coordinates must be an array of two numbers [lng, lat]'
            }
        } // [lng, lat]
    }
}, {timestamps: true});

// Index coordinates for geospatial queries (eg. nearby search)
locationSchema.index({ coord: '2dsphere' });

module.exports = mongoose.model('Location', locationSchema);