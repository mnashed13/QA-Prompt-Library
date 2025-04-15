const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file based on NODE_ENV
const envFile =
	process.env.NODE_ENV === 'production'
		? '.env.production'
		: '.env.development';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

module.exports = {
	// Server configuration
	NODE_ENV: process.env.NODE_ENV || 'development',
	PORT: parseInt(process.env.PORT || '3000', 10),

	// Database configuration
	DB_HOST: process.env.DB_HOST || 'localhost',
	DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
	DB_USER: process.env.DB_USER || 'postgres',
	DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
	DB_NAME: process.env.DB_NAME || 'api_db',

	// Redis configuration
	REDIS_HOST: process.env.REDIS_HOST || 'localhost',
	REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),

	// JWT configuration
	JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
	JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',

	// API Rate limiting
	RATE_LIMIT_WINDOW_MS: parseInt(
		process.env.RATE_LIMIT_WINDOW_MS || '900000',
		10
	), // 15 minutes
	RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),

	// CORS
	ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || '*',

	// Logging
	LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};
