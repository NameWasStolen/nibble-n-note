// Add Mongoose models + other imports here
const Location = require('../models/Location');
const mongoose = require('mongoose');
const { createOrUpdateLocation } = require('../services/locationService.js');

module.exports = {
    /**
     * findOrCreateLocation
     * Finds an existing location or creates a new one, based on Google Maps data
     */
    findOrCreateLocation: async (req, res) => {
        try {
            // Get location data from request body
            const { placeId, name, address, businessStatus, price, lat, lng } = req.body;

            // Validate required fields
            if (!placeId || !name || !address || lat === undefined || lng === undefined) {
                return res.status(400).json({ error: 'placeId, name, address, lat, and lng are required' });
            }

            // Use service function to find or create location
            const location = await createOrUpdateLocation({
                placeId,
                name,
                address,
                businessStatus,
                price,
                lat,
                lng
            });

            // Return the location data
            res.status(200).json(location);
        } catch (err) {
            // Log error and return 500
            console.error(err);
            res.status(500).json({ error: 'Failed to create or update location' });
        }
    },
    /**
     * getLocationById
     * Gets a location by its ID
     */
    getLocationById: async (req, res) => {
        try {
            // Get location _id from request params
            const { id } = req.params;

            // Validate ID format
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ error: 'Invalid location ID' });
            }

            // Attempt to find location by ID
            const location = await Location.findById(id)

            // If location not found, return 404
            if (!location) {
                return res.status(404).json({ error: 'Location not found' });
            }

            // Return the location data
            res.status(200).json(location);

        } catch (err) {
            // Log error and return 500
            console.error(err);
            res.status(500).json({ error: 'Failed to find location by ID' });
        }
    }
};