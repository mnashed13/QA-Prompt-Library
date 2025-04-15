const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const redis = require('redis');

// Database connection pool
const pool = new Pool({
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
});

// Redis client
const redisClient = redis.createClient({
	url: `redis://${process.env.REDIS_HOST || 'localhost'}:${
		process.env.REDIS_PORT || 6379
	}`,
});

// Health check endpoint
router.get('/', (req, res) => {
	res.status(200).json({
		status: 'UP',
		timestamp: new Date(),
		services: {
			database: 'UP',
			redis: 'UP',
		},
	});
});

module.exports = router;
