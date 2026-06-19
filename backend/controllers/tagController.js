// Add Mongoose models + other imports here
const mongoose = require('mongoose');
const tagService = require('../services/tagService');

module.exports = {
    createTag: async (req, res) => {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            
            // Get values to create Tag
            const { name, colour, category, groupId } = req.body || {};

            // Attempt Tag creation
            const result = await tagService.createTag({
                userId: req.userId,
                groupId,
                name,
                colour,
                category,
                session
            });

            await session.commitTransaction();

            return res.status(201).json(result);
        } catch (err) {
            // Abort transaction and log error
            await session.abortTransaction();
            console.error(err);

            // Duplicate key error (existing entry)
            if (err.code === 11000) {
                return res.status(409).json({
                    error: 'Tag already exists'
                });
            }

            // Custom HTTP error from service
            if (err.statusCode) {
                return res.status(err.statusCode).json({
                    error: err.message
                });
            }

            // Mongoose validation / cast error
            if (err.name === 'ValidationError' || err.name === 'CastError') {
                return res.status(400).json({
                    error: err.message
                });
            }

            // Catch-all for all other errors
            return res.status(500).json({
                error: 'Failed to create tag'
            });
        } finally {
            session.endSession();
        }
    }
};