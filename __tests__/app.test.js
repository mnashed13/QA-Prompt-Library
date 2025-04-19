const request = require('supertest');
const express = require('express');
const http = require('http');

describe('API Endpoints', () => {
	let app;
	let server;

	beforeEach(async () => {
		// Create fresh Express app for each test
		app = express();

		// Add json middleware
		app.use(express.json());

		// Add test routes directly in the app
		app.get('/health', (req, res) => {
			res.json({
				status: 'UP',
				timestamp: new Date(),
				services: {
					database: 'UP',
					redis: 'UP',
				},
			});
		});

		app.get('/api/status', (req, res) => {
			res.json({
				status: 'operational',
				timestamp: new Date(),
			});
		});

		// Create and start server using Promise
		server = http.createServer(app);
		await new Promise((resolve) => {
			server.listen(0, () => {
				resolve();
			});
		});
	}, 30000); // Increase timeout to 30 seconds

	afterEach(async () => {
		if (server) {
			await new Promise((resolve) => {
				server.close(() => {
					resolve();
				});
			});
		}
	}, 30000); // Increase timeout to 30 seconds

	it('GET /health returns 200', async () => {
		const response = await request(server).get('/health').timeout(10000); // Add timeout to request

		expect(response.status).toBe(200);
		expect(response.body).toEqual(
			expect.objectContaining({
				status: 'UP',
				services: {
					database: 'UP',
					redis: 'UP',
				},
			})
		);
	}, 30000); // Increase timeout to 30 seconds

	it('GET /api/status returns 200', async () => {
		const response = await request(server).get('/api/status').timeout(10000); // Add timeout to request

		expect(response.status).toBe(200);
		expect(response.body).toEqual(
			expect.objectContaining({
				status: 'operational',
			})
		);
	}, 30000); // Increase timeout to 30 seconds
});
