const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

module.exports = (app) => {
	// Set security headers with Helmet
	app.use(helmet());

	// Configure CORS
	const corsOptions = {
		origin: process.env.ALLOWED_ORIGINS
			? process.env.ALLOWED_ORIGINS.split(',')
			: '*',
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
		allowedHeaders: ['Content-Type', 'Authorization'],
		credentials: true,
		maxAge: 86400, // 24 hours
	};
	app.use(cors(corsOptions));

	// Rate limiting
	const apiLimiter = rateLimit({
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: 100, // limit each IP to 100 requests per windowMs
		standardHeaders: true,
		legacyHeaders: false,
		message:
			'Too many requests from this IP, please try again after 15 minutes',
	});
	app.use('/api/', apiLimiter);

	// JSON request size limiting
	app.use(express.json({ limit: '1mb' }));
	app.use(express.urlencoded({ extended: true, limit: '1mb' }));
};
