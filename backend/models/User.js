const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'user', // Default role is 'user', but you can set 'admin' for admin users
    },
    resources: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource'  // This will allow you to populate the resources for a user
    }]
});

module.exports = mongoose.model('User', UserSchema);
