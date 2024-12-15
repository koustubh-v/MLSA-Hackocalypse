const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');

// POST request to add a resource
router.post('/', resourceController.addResource);

module.exports = router;