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
    },
    getGroupById: async (req, res) => {
        try {
            const { id } = req.params;

            // Get group information
            const result = await groupService.getGroupById({
                groupId: id,
                userId: req.userId
            });

            return res.status(200).json(result);
        } catch (err) {
            // Log error
            console.error(err);

            // Custom service-level HTTP error
            if (err.statusCode) {
                return res.status(err.statusCode).json({ error: err.message });
            }

            // Mongoose validation / cast error
            if (err.name === 'ValidationError' || err.name === 'CastError') {
                return res.status(400).json({ error: err.message });
            }

            // Catch-all for other errors
            return res.status(500).json({ error: 'Failed to get group' });
        }
    }, 
    updateGroup: async (req, res) => {
        try {
            // Get vars
            const { id } = req.params;
            const { name } = req.body || {}; // If name undefined, set to empty object and catch error within service

            // Try to update group
            const result = await groupService.updateGroup({
                groupId: id,
                userId: req.userId,
                name
            });

            return res.status(200).json(result);
        } catch (err) {
            // Log error
            console.error(err);

            // Custom service-level HTTP error
            if (err.statusCode) {
                return res.status(err.statusCode).json({ error: err.message });
            }

            // Mongoose validation / cast error
            if (err.name === 'ValidationError' || err.name === 'CastError') {
                return res.status(400).json({ error: err.message });
            }

            // Catch-all for other errors
            return res.status(500).json({ error: 'Failed to update group' });
        }
    },
    deleteGroup: async (req, res) => {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            const { id } = req.params;

            // Delete group members + group
            const result = await groupService.deleteGroup({
                groupId: id,
                userId: req.userId,
                session
            });

            await session.commitTransaction();

            return res.status(200).json(result);
        } catch (err) {
            // If failed, abort transaction and log error response
            await session.abortTransaction();
            console.error(err);

            // Custom HTTP service error
            if (err.statusCode) {
                return res.status(err.statusCode).json({ error: err.message });
            }

            // Mongoose validation / cast error
            if (err.name === 'ValidationError' || err.name === 'CastError') {
                return res.status(400).json({ error: err.message });
            }

            // Catch-all for all other errors
            return res.status(500).json({ error: 'Failed to delete group' });
        } finally {
            session.endSession();
        }
    },
    addGroupMember: async (req, res) => {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            
            // Get required details
            const { groupId } = req.params;
            const { userId, role } = req.body || {};

            // Attempt to add group member
            const result = await groupService.addGroupMember({
                groupId,
                senderUserId: req.userId,
                receiverUserId: userId,
                role,
                session
            });

            await session.commitTransaction();

            return res.status(201).json(result);
        } catch (err) {
            // Abord transaction and log error
            await session.abortTransaction();
            console.error(err);

            // Duplicate key error (member already part of group)
            if (err.code === 11000) {
                return res.status(409).json({
                    error: 'User is already a member of this group'
                });
            }

            // Custom HTTP error message from service
            if (err.statusCode) {
                return res.status(err.statusCode).json({ error: err.message });
            }

            // Mongoose validation / cast error
            if (err.name === 'ValidationError' || err.name === 'CastError') {
                return res.status(400).json({ error: err.message });
            }

            // Catch-all for other errors
            return res.status(500).json({
                error: 'Failed to add group member'
            });
        } finally {
            session.endSession();
        }
    }
};