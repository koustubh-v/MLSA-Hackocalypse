require('dotenv').config();  // Ensure dotenv is loaded at the top
const express = require('express');
const mongoose = require('./config/db');  // Your db.js where mongoose is initialized
const authRoutes = require('./routes/auth');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');  // Ensure the User model is imported
const Resource = require('./models/Resource');  // Import the Resource model
const authMiddleware = require('./middleware/authMiddleware');  // Import authentication middleware

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: ['http://localhost:3000', 'http://127.0.0.1:5500'],  // Frontend URL
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true,
    }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);

// POST route to handle resource creation
app.post('/api/resources', authMiddleware, async (req, res) => {
    const { resource } = req.body;

    // Validate input
    if (!resource || !resource.name || !resource.type) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    try {
        // Find user by decoded token id
        const user = await User.findById(req.user);  // req.user is set by authMiddleware

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

            // Emit an event to update clients about the new resource
            io.emit('updateResources', newResource);

            return res.status(200).json({ success: true, message: 'Resource added successfully!' });
        } else {
            return res.status(400).json({ success: false, message: 'User not found.' });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to add resource.' });
    }
});

// GET route to retrieve all resources
app.get('/api/resources', async (req, res) => {
    try {
        const resources = await Resource.find();  // Retrieve all resources from the database
        return res.status(200).json({ success: true, resources });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to fetch resources.' });
    }
});

// Socket.IO event handling
io.on('connection', (socket) => {
    console.log('New client connected');

    // Listen for the broadcast message from the client
    socket.on('broadcastMessage', async (data) => {
        const { token, message } = data;

        try {
            // Verify the JWT token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);

            if (user && user.role === 'admin') {
                // Only allow broadcast if the user is admin
                io.emit('broadcastMessage', message);  // Broadcast to all clients
            } else {
                // If not admin, send error to client
                socket.emit('error', { msg: 'You must be an admin to broadcast messages.' });
            }
        } catch (err) {
            socket.emit('error', { msg: 'Invalid or expired token.' });
        }
    });

    // Handle adding a new resource (using Socket.IO)
    socket.on('addResource', async (data) => {
        const { token, resource } = data;

        try {
            // Verify the JWT token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);

            if (user) {
                // Save the resource to the database
                const newResource = new Resource({
                    name: resource.name,
                    image: resource.image,
                    details: resource.details,
                    type: resource.type,
                    userId: user._id  // Associate resource with the user
                });

                await newResource.save();  // Save the new resource

                // Broadcast the new resource to all connected clients
                io.emit('updateResources', newResource);
                socket.emit('success', { msg: 'Resource added successfully.' }); // Optional success response
            } else {
                socket.emit('error', { msg: 'User not found or invalid token.' });
            }
        } catch (err) {
            socket.emit('error', { msg: 'Invalid or expired token.' });
        }
    });

    // Broadcast chat messages
    socket.on('chatMessage', (message) => {
        io.emit('chatMessage', message);  // Broadcast message to all clients
    });

    // When a user disconnects
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Default Route
app.get('/', (req, res) => {
    res.send('Server is running...');
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
