// Imports
const express = require("express");
const cors = require("cors"); // CORS ONLY FOR DEVELOPMENT (remove after deployment)
const { connectToMongoDB } = require("./db/connection.js"); // Importing Mongoose connection
require('dotenv').config();

// Constants
const PORT_NUMBER = process.env.PORT || 5000;

// Creating app
const app = express();

// Middlewares
app.use(express.json()); // Converts data to JSON in req.body
app.use(cors()); // Enabling CORS ONLY FOR DEVELOPMENT (remove after deployment)

// Import Routers
const authRouter = require('./routes/auth_router.js');
const userRouter = require('./routes/user_router.js');

// Setting Routers
// Authentication-related routes
app.use('/api/auth', authRouter);

// User-related routes
app.use('/api/users', userRouter);

// Test route
app.get('/ping', (req, res) => 
    res.send('Server received ping!')
);

// Preparing JSON catch-all for RESTful standards
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "Page Not Found",
        message: `The following request could not be found: ${req.method} ${req.originalUrl}`
    });
});

// Starting Server
async function startServer(){
    try {
        // Connect to MongoDB via Mongoose
        await connectToMongoDB();
        // Start server
        app.listen(PORT_NUMBER, () => {
            console.log(`Server is running on Port: ${PORT_NUMBER}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();