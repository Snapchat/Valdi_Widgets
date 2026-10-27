module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.integration.test.js'],
  testTimeout: 60000,
  // Each test file launches its own Chrome. On CI that is the x64 build under Rosetta, and two launching at once
  // can miss puppeteer's 30s launch timeout.
  maxWorkers: 1,
  verbose: true,
};
