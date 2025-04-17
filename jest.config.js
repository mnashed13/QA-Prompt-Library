module.exports = {
	testEnvironment: 'node',
	setupFiles: ['<rootDir>/jest.setup.js'],
	testMatch: ['**/__tests__/**/*.test.js'],
	collectCoverage: true,
	coverageDirectory: 'coverage',
	coveragePathIgnorePatterns: [
		'/node_modules/',
		'/coverage/',
		'/dist/',
		'/__tests__/fixtures/',
	],
	moduleFileExtensions: ['js', 'json'],
	testPathIgnorePatterns: ['/node_modules/'],
	verbose: true,
	testTimeout: 10000,
	coverageReporters: ['text', 'lcov', 'clover'],
};
