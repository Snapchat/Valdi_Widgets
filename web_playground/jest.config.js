module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.integration.test.js'],
  testTimeout: 60000,
  globalSetup: '<rootDir>/tests/global_setup.js',
  // Each test file launches its own Chrome; launching two at once on small CI runners can miss puppeteer's 30s
  // launch timeout.
  maxWorkers: 1,
  verbose: true,
};
