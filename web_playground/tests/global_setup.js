const path = require('path');
const { install, computeExecutablePath } = require('@puppeteer/browsers');

// Must match the build valdi-web-devtools' test runner downloads.
const CHROME_BUILD_ID = '131.0.6778.87';

// The devtools test runner always downloads the x64 macOS Chrome. Under Rosetta on Apple Silicon CI runners its
// first launch can outlast puppeteer's 30s timeout, so install the native arm64 build and point puppeteer at it.
// Runs in jest's globalSetup because @puppeteer/browsers' dynamic import fails inside a test's VM context.
module.exports = async () => {
  if (process.platform !== 'darwin' || process.arch !== 'arm64') {
    return;
  }
  const options = {
    browser: 'chrome-headless-shell',
    buildId: CHROME_BUILD_ID,
    platform: 'mac_arm',
    cacheDir: path.join(process.cwd(), 'tests', '.chrome-cache'),
  };
  await install(options);
  process.env.PUPPETEER_EXECUTABLE_PATH = computeExecutablePath(options);
};
