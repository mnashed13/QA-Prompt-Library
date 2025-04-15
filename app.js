const express = require('express');
const config = require('./config/environment');
const logger = require('./utils/logger');
const securityMiddleware = require('./middleware/security');
const {
	requestTracker,
	setupProcessMonitoring,
} = require('./utils/monitoring');

// Initialize Express app
const app = express();

// Apply security middleware
securityMiddleware(app);

// Apply request tracking middleware
app.use(requestTracker);

// Import route modules
const healthRoutes = require('./routes/health');
const apiRoutes = require('./routes/api');

// Register routes
app.use('/health', healthRoutes);
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
	logger.error(`${err.name}: ${err.message}`, {
		path: req.path,
		method: req.method,
		stack: err.stack,
	});

	const statusCode = err.statusCode || 500;
	const message =
		process.env.NODE_ENV === 'production' && statusCode === 500
			? 'Internal Server Error'
			: err.message;

	res.status(statusCode).json({
		error: {
			message,
			status: statusCode,
		},
	});
});

// Start the server
const server = app.listen(config.PORT, () => {
	logger.info(
		`Server running in ${config.NODE_ENV} mode on port ${config.PORT}`
	);

	// Setup process monitoring
	setupProcessMonitoring();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
	logger.error('Unhandled Promise Rejection:', err);
	// In production, we might want to gracefully shut down
	if (process.env.NODE_ENV === 'production') {
		server.close(() => {
			process.exit(1);
		});
	}
});

module.exports = app;
