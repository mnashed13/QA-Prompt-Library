// Set up environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = 3001; // Use a different port for testing

// Mock environment variables
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_USER = 'test';
process.env.DB_PASSWORD = 'test';
process.env.DB_NAME = 'test_db';

process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';

process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';

process.env.ALLOWED_ORIGINS = 'http://localhost:3000';

// Mock modules that might cause issues
jest.mock('pg', () => ({
	Pool: jest.fn(() => ({
		query: jest.fn(),
		end: jest.fn(),
		on: jest.fn(),
	})),
}));

jest.mock('redis', () => ({
	createClient: jest.fn(() => ({
		connect: jest.fn(),
		get: jest.fn(),
		set: jest.fn(),
		setEx: jest.fn(),
	})),
}));

// Mock Express
jest.mock('express', () => {
	const mockResponse = {
		status: jest.fn().mockReturnThis(),
		json: jest.fn().mockReturnThis(),
		send: jest.fn().mockReturnThis(),
	};

	const mockRequest = {
		body: {},
		params: {},
		query: {},
	};

	const mockNext = jest.fn();

	const mockApp = {
		use: jest.fn(),
		get: jest.fn((path, callback) => {
			if (typeof callback === 'function') {
				callback(mockRequest, mockResponse, mockNext);
			}
			return mockApp;
		}),
		post: jest.fn(),
		listen: jest.fn((port, callback) => {
			if (callback) callback();
			return {
				address: () => ({ port }),
				close: (cb) => cb && cb(),
			};
		}),
	};

	const mockRouter = () => ({
		use: jest.fn(),
		get: jest.fn(),
		post: jest.fn(),
	});

	const mockExpress = () => mockApp;
	mockExpress.Router = jest.fn(() => mockRouter());
	mockExpress.json = jest.fn(() => (req, res, next) => next());
	mockExpress.urlencoded = jest.fn(() => (req, res, next) => next());

	return mockExpress;
});

// Mock security-related packages
jest.mock('helmet', () => {
	return () => (req, res, next) => next();
});

jest.mock('cors', () => {
	return () => (req, res, next) => next();
});

jest.mock('express-rate-limit', () => {
	return () => (req, res, next) => next();
});
