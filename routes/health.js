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
router.get('/', async (req, res) => {
	const health = {
		status: 'UP',
		timestamp: new Date(),
		services: {
			database: 'DOWN',
			redis: 'DOWN',
		},
	};

	// Check database connection
	try {
		const dbResult = await pool.query('SELECT 1');
		if (dbResult.rows.length > 0) {
			health.services.database = 'UP';
		}
	} catch (error) {
		health.services.database = `DOWN: ${error.message}`;
	}

	// Check Redis connection
	try {
		await redisClient.ping();
		health.services.redis = 'UP';
	} catch (error) {
		health.services.redis = `DOWN: ${error.message}`;
	}

	// If any service is down, return 503
	if (
		Object.values(health.services).some((status) => status.includes('DOWN'))
	) {
		health.status = 'DOWN';
		return res.status(503).json(health);
	}

	return res.status(200).json(health);
});

module.exports = router;
