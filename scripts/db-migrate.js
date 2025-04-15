/**
 * Database migration script
 * Run with: node scripts/db-migrate.js
 */
const { Pool } = require('pg');
const config = require('../config/environment');
const logger = require('../utils/logger');

// Database connection pool
const pool = new Pool({
	host: config.DB_HOST,
	port: config.DB_PORT,
	user: config.DB_USER,
	password: config.DB_PASSWORD,
	database: config.DB_NAME,
});

async function migrate() {
	try {
		logger.info('Starting database migrations...');

		// Create migrations table if it doesn't exist
		await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

		// Check which migrations have been applied
		const { rows } = await pool.query('SELECT name FROM migrations;');
		const appliedMigrations = rows.map((row) => row.name);

		// Define your migrations
		const migrations = [
			{
				name: '001_initial_schema',
				up: `
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
          );
          
          CREATE TABLE IF NOT EXISTS items (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
          );
        `,
			},
			{
				name: '002_add_user_roles',
				up: `
          ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'user';
          CREATE INDEX idx_users_role ON users(role);
        `,
			},
		];

		// Apply pending migrations
		for (const migration of migrations) {
			if (!appliedMigrations.includes(migration.name)) {
				logger.info(`Applying migration: ${migration.name}`);

				// Start a transaction
				const client = await pool.connect();
				try {
					await client.query('BEGIN');
					await client.query(migration.up);
					await client.query('INSERT INTO migrations (name) VALUES ($1)', [
						migration.name,
					]);
					await client.query('COMMIT');
					logger.info(`Migration ${migration.name} applied successfully`);
				} catch (error) {
					await client.query('ROLLBACK');
					logger.error(`Migration ${migration.name} failed:`, error);
					throw error;
				} finally {
					client.release();
				}
			} else {
				logger.info(`Migration ${migration.name} already applied, skipping`);
			}
		}

		logger.info('All migrations completed');
	} catch (error) {
		logger.error('Migration process failed:', error);
		process.exit(1);
	} finally {
		await pool.end();
	}
}

// Run migrations
migrate();
