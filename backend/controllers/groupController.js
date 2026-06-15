const mongoose = require('mongoose');
const groupService = require('../services/groupService');

module.exports = {
    createGroup: async (req, res) => {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            const { name } = req.body;

            // Create the group + owner groupMember entries
            const result = await groupService.createGroup({
                userId: req.userId,
                name,
                session
            });

            await session.commitTransaction();

            return res.status(201).json(result);
        } catch (err) {
            // If error, abort transaction and return error response
            await session.abortTransaction();
            console.error(err);

            // Custom HTTP errors thrown by service
            if (err.statusCode) {
                return res.status(err.statusCode).json({ error: err.message });
            }

            // Mongoose validation / casting error
            if (err.name === 'ValidationError' || err.name === 'CastError') {
                return res.status(400).json({ error: err.message });
            }

            // Duplicate entry error
            if (err.code === 11000) {
                return res.status(409).json({
                    error: 'Group could not be created because of a duplicate value'
                });
            }

            // Catch-all for other errors
            return res.status(500).json({ error: 'Failed to create group' });
        } finally {
            session.endSession();
        }
    }, 
    getUserGroups: async (req, res) => {
        try {
            // Fetch user's groups
            const result = await groupService.getUserGroups({
                userId: req.userId
            });

            return res.status(200).json(result);
        } catch (err) {
            // Log error
            console.error(err);

            // Custom HTTP errors thrown by service
            if (err.statusCode) {
                return res.status(err.statusCode).json({ error: err.message });
            }

            // Mongoose validation / casting error
            if (err.name === 'ValidationError' || err.name === 'CastError') {
                return res.status(400).json({ error: err.message });
            }

            // Catch-all for other errors
            return res.status(500).json({ error: 'Failed to get groups' });
        }
    }
};