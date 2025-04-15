const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const securityMiddleware = (req, res, next) => {
	// Apply security headers
	helmet()(req, res, () => {});

	// Apply CORS
	cors({
		origin: process.env.ALLOWED_ORIGINS
			? process.env.ALLOWED_ORIGINS.split(',')
			: '*',
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
		allowedHeaders: ['Content-Type', 'Authorization'],
		credentials: true,
		maxAge: 86400,
	})(req, res, () => {});

	// Apply rate limiting in production
	if (process.env.NODE_ENV === 'production') {
		rateLimit({
			windowMs: 15 * 60 * 1000,
			max: 100,
		})(req, res, () => {});
	}

	next();
};

module.exports = securityMiddleware;
