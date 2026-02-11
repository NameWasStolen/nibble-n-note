const Location = require('../models/locationModel');

async function createOrUpdateLocation({ placeId, name, address, businessStatus, price, lat, lng }) {
  const coord = { 
    type: 'Point', 
    coordinates: [Number(lng), Number(lat)] 
};

  const location = await Location.findOneAndUpdate(
    { placeId },
    { name, address, businessStatus: businessStatus || 'OPERATIONAL', price, coord },
    { new: true, upsert: true, runValidators: true }
  );

  return location;
}

module.exports = { createOrUpdateLocation };