const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    name: { 
        type: String, 
        required: true,
        trim: true, 
        maxlength: 100 // Max reasonable name length
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true, 
        trim: true, 
        maxlength: 254 // Max valid email length
    }
}, {timestamps: true }); // createdAt, updatedAt fields

module.exports = mongoose.model('User', userSchema);