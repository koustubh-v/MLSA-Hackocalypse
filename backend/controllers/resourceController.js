const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Resource = require('../models/Resource');

// Controller to add a new resource
const addResource = async (req, res) => {
    const { token, resource } = req.body;

    if (!token || !resource || !resource.name || !resource.type) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    try {
        // Verify the JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (user) {
            // Save the new resource
            const newResource = new Resource({
                name: resource.name,
                image: resource.image,
                details: resource.details,
                type: resource.type,
                userId: user._id,  // Associate resource with the user
            });

            await newResource.save();  // Save the new resource

            return res.status(200).json({ success: true, message: 'Resource added successfully!' });
        } else {
            return res.status(400).json({ success: false, message: 'User not found or invalid token.' });
        }
    } catch (err) {
        return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }
};

module.exports = { addResource };
