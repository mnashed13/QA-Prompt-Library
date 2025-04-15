const redis = require('redis');
const config = require('../config/environment');
const logger = require('../utils/logger');

const redisClient = redis.createClient({
	url: `redis://${config.REDIS_HOST}:${config.REDIS_PORT}`,
});

// Connect to Redis
(async () => {
	try {
		await redisClient.connect();
		logger.info('Redis client connected');
	} catch (err) {
		logger.error('Redis connection error:', err);
	}
})();

// Cache middleware
const cache = (duration) => {
	return async (req, res, next) => {
		// Skip caching for non-GET requests
		if (req.method !== 'GET') {
			return next();
		}

		const key = `__api_cache__${req.originalUrl}`;

		try {
			const cachedResponse = await redisClient.get(key);

			if (cachedResponse) {
				const data = JSON.parse(cachedResponse);
				logger.debug('Cache hit for:', key);
				return res.status(200).json(data);
			}

			// Cache miss - replace res.json with custom implementation
			const originalJson = res.json;
			res.json = function (data) {
				// Store response in cache
				redisClient
					.setEx(key, duration, JSON.stringify(data))
					.catch((err) => logger.error('Redis caching error:', err));

				// Call original json method
				return originalJson.call(this, data);
			};

			next();
		} catch (error) {
			logger.error('Cache middleware error:', error);
			next();
		}
	};
};

module.exports = { cache };
