const Location = require('../models/Location');

async function createOrUpdateLocation({ placeId, name, address, businessStatus, price, lat, lng }) {
  const coord = { 
    type: 'Point', 
    coordinates: [Number(lng), Number(lat)] 
  };

  const location = await Location.findOneAndUpdate(
    { placeId }, // placeId is unique google places identifier
    { name, address, businessStatus: businessStatus || null, price, coord }, // Fields to update
    { returnDocument: 'after', upsert: true, runValidators: true } // Options for findOneAndUpdate
  );

  return location;
}

module.exports = { createOrUpdateLocation };