const request = require('supertest');
const app = require('../app');

describe('API Endpoints', () => {
	it('GET /health returns 200', async () => {
		// Mock the database and redis connections
		jest.mock('../routes/health', () => {
			const express = require('express');
			const router = express.Router();

			router.get('/', (req, res) => {
				return res.status(200).json({
					status: 'UP',
					timestamp: new Date(),
					services: {
						database: 'UP',
						redis: 'UP',
					},
				});
			});

			return router;
		});

		const response = await request(app).get('/health');
		expect(response.statusCode).toBe(200);
		expect(response.body.status).toBe('UP');
	});

	it('GET /api/status returns 200', async () => {
		const response = await request(app).get('/api/status');
		expect(response.statusCode).toBe(200);
		expect(response.body.status).toBe('operational');
	});
});
