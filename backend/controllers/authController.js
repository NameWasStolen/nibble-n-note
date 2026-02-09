// Add Mongoose models + other imports here
const User = require('../models/User.js');
const jwt = require('jsonwebtoken');
const client = require('../services/googleAuthClient.js');


module.exports = {
    googleLogin: async (req, res) => {
        try {
            // Verify the token was sent by client
            const { idToken } = req.body;
            if (!idToken) {
                return res.status(400).json({ error: 'No ID Token given' });
            }

            // Verify token with Google
            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID // audience checks if token is meant for our app
            });

            const { sub: googleId, email, name } = ticket.getPayload();// getPayload gives us decoded token info, sub is unique Google user ID

            // Find or create user
            let user = await User.findOne({ googleId });
            if (!user) {
                user = await User.create({ googleId, email, name });
            } else if (user.email !== email || user.name !== name) {
                // Update if email or name changed
                user.email = email;
                user.name = name;
                await user.save();
            }

            // Create JWT for your app
            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Send JWT to client
            res.json({ token });

        } catch (err) {
            console.error(err);
            res.status(401).json({ error: 'Invalid Google token' });
        }
    }
};