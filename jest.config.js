module.exports = {
	testEnvironment: 'node',
	verbose: true,
	testTimeout: 30000,
	collectCoverage: true,
	coverageDirectory: 'coverage',
	coverageReporters: ['text', 'lcov', 'clover'],
	coveragePathIgnorePatterns: ['/node_modules/', '/coverage/', '/dist/'],
	testMatch: ['**/__tests__/**/*.test.js'],
	setupFilesAfterEnv: ['./jest.setup.js'],
};
