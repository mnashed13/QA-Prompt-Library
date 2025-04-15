const express = require('express');
const router = express.Router();
const { cache } = require('../middleware/cache');
const logger = require('../utils/logger');

// Sample API endpoints
router.get('/status', (req, res) => {
	return res.status(200).json({
		status: 'operational',
		timestamp: new Date(),
	});
});

router.get('/users', cache(300), (req, res) => {
	// This would typically fetch from a database
	logger.info('Users endpoint called');
	return res.json({
		users: [
			{ id: 1, name: 'John Doe' },
			{ id: 2, name: 'Jane Smith' },
		],
	});
});

router.post('/users', (req, res) => {
	// This would typically save to a database
	logger.info('Create user endpoint called', { body: req.body });

	// Validate input
	if (!req.body.name) {
		return res.status(400).json({
			error: {
				message: 'Name is required',
				status: 400,
			},
		});
	}

	return res.status(201).json({
		user: {
			id: Math.floor(Math.random() * 1000),
			name: req.body.name,
			createdAt: new Date(),
		},
	});
});

module.exports = router;
