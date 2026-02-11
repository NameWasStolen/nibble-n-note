const Location = require('../models/locationModel');

module.exports = {
    createLocation: async (req, res) => {
        try {
            // Retrieve data from request body
            const { placeId, name, address, businessStatus, price, lat, lng } = req.body;
            
            // Validate required fields
            if (!placeId || !name || !address || lat === undefined || lng === undefined) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            // Convert lat/lng to GeoJSON format
            const coord = {
                type: 'Point',
                coordinates: [lng, lat] // [lng, lat] for GeoJSON
            };

            // Create new location document
            const newLocation = new Location({
                placeId,
                name,
                address,
                businessStatus: businessStatus || 'OPERATIONAL', // Default to OPERATIONAL if not provided
                price,
                coord
            });

            // Save the new location to the database
            const savedLocation = await newLocation.save();

            res.status(201).json(savedLocation);

        } catch (err) {
            console.error('Error creating location:', err);
            res.status(500).json({ error: 'Failed to create location', details: err.message });
        }
    }
}