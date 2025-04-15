const logger = require('./logger');
const { performance } = require('perf_hooks');

// Custom middleware to track request duration
const requestTracker = (req, res, next) => {
	const start = performance.now();

	// Override end function to log request metrics
	const originalEnd = res.end;
	res.end = function () {
		const duration = performance.now() - start;
		logger.info('API Request', {
			method: req.method,
			path: req.path,
			statusCode: res.statusCode,
			duration: `${duration.toFixed(2)}ms`,
		});

		// Call original end function
		return originalEnd.apply(this, arguments);
	};

	next();
};

// Register process metrics
const setupProcessMonitoring = () => {
	// Monitor memory usage
	setInterval(() => {
		const memoryUsage = process.memoryUsage();
		logger.debug('Memory Usage', {
			rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
			heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
			heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
		});
	}, 60000); // Log every minute
};

module.exports = {
	requestTracker,
	setupProcessMonitoring,
};
