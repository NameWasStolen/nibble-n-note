const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    placeId: {
        type: String,
        required: true,
        unique: true,
        index: true // Added for faster location queries
    },
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    businessStatus: {
        type: String,
        enum: ['OPERATIONAL', 'CLOSED_TEMPORARILY', 'CLOSED_PERMANENTLY'],
        default: 'OPERATIONAL'
    },
    price:{
        type: Number,
        min: 0,
        max: 4
    },
    coord: { // GeoJSON format (object with type, coordinates attributes)
        type: { 
            type: String, 
            default: 'Point' 
        },
        coordinates: { 
            type: [Number], 
            required: true 
        } // [lng, lat]
    }
}, {timestamps: true});

// Index coordinates for geospatial queries (eg. nearby search)
locationSchema.index({ coord: '2dsphere' });

module.exports = mongoose.model('Location', locationSchema);