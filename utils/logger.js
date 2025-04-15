const winston = require('winston');
const config = require('../config/environment');

// Define log format
const logFormat = winston.format.combine(
	winston.format.timestamp(),
	winston.format.errors({ stack: true }),
	winston.format.json()
);

// Create the logger
const logger = winston.createLogger({
	level: config.LOG_LEVEL,
	format: logFormat,
	defaultMeta: { service: 'api-service' },
	transports: [
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.simple()
			),
		}),
	],
});

// In production, also log to a file
if (process.env.NODE_ENV === 'production') {
	logger.add(
		new winston.transports.File({
			filename: 'logs/error.log',
			level: 'error',
			maxsize: 5242880, // 5MB
			maxFiles: 5,
		})
	);
	logger.add(
		new winston.transports.File({
			filename: 'logs/combined.log',
			maxsize: 5242880, // 5MB
			maxFiles: 5,
		})
	);
}

module.exports = logger;
