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
                coordinates: [Number(lng), Number(lat)] // [lng, lat] for GeoJSON
            };

            // Create/update new location document
            const location = await Location.findOneAndUpdate(
                { placeId }, // filter
                {
                name,
                address,
                businessStatus: businessStatus || 'OPERATIONAL',
                price,
                coord
                },
                {
                new: true,        // return updated document
                upsert: true,     // create if doesn't exist
                runValidators: true
                }
            );

            res.status(200).json(location);

        } catch (err) {
            console.error('Error creating/updating location:', err);
            res.status(500).json({ error: 'Failed to create/update location', details: err.message });
        }
    }
}