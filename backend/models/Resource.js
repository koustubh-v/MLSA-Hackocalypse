const mongoose = require('mongoose');

// Define the Resource Schema
const ResourceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    details: { type: String, required: true },
    type: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Associate resource with user
    createdAt: { type: Date, default: Date.now }  // Timestamp for when the resource was added
});

// Create and export the Resource model
module.exports = mongoose.model('Resource', ResourceSchema);
