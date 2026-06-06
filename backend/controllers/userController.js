// Add Mongoose models + other imports here
const User = require('../models/User.js');

module.exports = {
    /**
     * getCurrentUser
     * Gets the currently authenticated user
     */
    getCurrentUser: async (req, res) => {
        // Note: req.userId is set by authMiddleware if JWT is valid
        try {
            // Find user by ID from JWT
            const user = await User.findById(req.userId);

            // If user not found, return 404
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Return user info (excluding sensitive data)
            res.status(200).json({
                id: user._id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            });
        } catch (err) {
            // Log error and return 500
            console.error(err);
            res.status(500).json({ error: 'Failed to retrieve user' });
        }
    }
};