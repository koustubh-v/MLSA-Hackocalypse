// authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ msg: 'You must be logged in to add a resource.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.id;  // Attach the user's id to the request object
        next();
    } catch (err) {
        return res.status(401).json({ msg: 'Token is not valid or expired.' });
    }
};
