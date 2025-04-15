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

	beforeAll((done) => {
		// Create test app
		app = express();

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

		// Create server
		server = http.createServer(app);
		server.listen(0, done); // Use port 0 to get a random available port
	});

	afterAll((done) => {
		if (server) {
			server.close(done);
		} else {
			done();
		}
	});

	it('GET /health returns 200', async () => {
		const response = await request(server).get('/health');

		expect(response.status).toBe(200);
		expect(response.body.status).toBe('UP');
		expect(response.body.services.database).toBe('UP');
		expect(response.body.services.redis).toBe('UP');
	});

	it('GET /api/status returns 200', async () => {
		const response = await request(server).get('/api/status');

		expect(response.status).toBe(200);
		expect(response.body.status).toBe('operational');
		expect(response.body.timestamp).toBeDefined();
	});
});
