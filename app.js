const express = require('express');
const config = require('./config/environment');
const logger = require('./utils/logger');
const {
	requestTracker,
	setupProcessMonitoring,
} = require('./utils/monitoring');
const securityMiddleware = require('./middleware/security');

// Initialize Express app
const app = express();

// Apply middleware
app.use(express.json());
app.use(securityMiddleware);
app.use(requestTracker);

// Routes
app.get('/health', (req, res) => {
	res.status(200).json({
		status: 'UP',
		timestamp: new Date(),
		services: {
			database: 'UP',
			redis: 'UP',
		},
	});
});

app.get('/api/status', (req, res) => {
	res.status(200).json({
		status: 'operational',
		timestamp: new Date(),
	});
});

// Error handling middleware
app.use((err, req, res, next) => {
	logger.error(err.stack);
	res.status(500).json({
		error: {
			message: 'Internal Server Error',
			status: 500,
		},
	});
});

// Only start the server if not in test environment
if (process.env.NODE_ENV !== 'test') {
	app.listen(config.PORT, () => {
		logger.info(
			`Server running in ${config.NODE_ENV} mode on port ${config.PORT}`
		);
		setupProcessMonitoring();
	});
}

module.exports = app;
