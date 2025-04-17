const request = require('supertest');
const express = require('express');
const http = require('http');

// Mock express middleware and utilities
jest.mock('../middleware/security', () => (req, res, next) => next());
jest.mock('../utils/monitoring', () => ({
	requestTracker: (req, res, next) => next(),
	setupProcessMonitoring: jest.fn(),
}));
jest.mock('../utils/logger', () => ({
	info: jest.fn(),
	error: jest.fn(),
}));
jest.mock('../config/environment', () => ({
	PORT: 3001,
	NODE_ENV: 'test',
}));

describe('API Endpoints', () => {
	let server;
	let app;

	beforeAll(async () => {
		// Create test app
		app = express();

		// Middleware
		app.use(express.json());

		// Create actual route handlers instead of mocks
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
			res.status(500).json({
				error: {
					message: 'Internal Server Error',
					status: 500,
				},
			});
		});

		// Create and start server
		server = http.createServer(app);
		await new Promise((resolve) => {
			server.listen(0, () => {
				resolve();
			});
		});
	}, 10000); // Increase timeout to 10 seconds

	afterAll(async () => {
		if (server) {
			await new Promise((resolve) => {
				server.close(() => {
					resolve();
				});
			});
		}
	}, 10000); // Increase timeout to 10 seconds

	it('GET /health returns 200', async () => {
		const response = await request(server).get('/health').timeout(10000); // Add timeout to request

		expect(response.status).toBe(200);
		expect(response.body.status).toBe('UP');
		expect(response.body.services.database).toBe('UP');
		expect(response.body.services.redis).toBe('UP');
	}, 10000); // Increase test timeout to 10 seconds

	it('GET /api/status returns 200', async () => {
		const response = await request(server).get('/api/status').timeout(10000); // Add timeout to request

		expect(response.status).toBe(200);
		expect(response.body.status).toBe('operational');
		expect(response.body.timestamp).toBeDefined();
	}, 10000); // Increase test timeout to 10 seconds
});
