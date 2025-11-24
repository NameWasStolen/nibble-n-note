require('dotenv').config();

const mongoose = require('mongoose');

const mongoURI = process.env.DB_URL; // Database name

async function connectToMongoDB() {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB via Mongoose');
    } catch (error) {
        console.error('MongoDB Connection Error: ', error);
        throw error;
    }
}

// Handle connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error: ', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from MongoDB');
});

// Graceful Shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('Mongoose connection closed due to app termination');
    process.exit(0);
});

module.exports = { connectToMongoDB };