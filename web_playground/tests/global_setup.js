const path = require('path');
const { BrowserPlatform, computeExecutablePath, detectBrowserPlatform, install } = require('@puppeteer/browsers');

// Must match the build valdi-web-devtools' test runner downloads.
const CHROME_BUILD_ID = '131.0.6778.87';

// The devtools test runner picks the Chrome build from the OS alone, so on Apple Silicon it runs the x64 build under
// Rosetta, whose first launch can outlast puppeteer's 30s timeout. Install the build for the machine's actual
// platform and point puppeteer at it. Chrome for Testing has no linux-arm64 build, so there the runner's choice stands.
// Runs in jest's globalSetup because @puppeteer/browsers' dynamic import fails inside a test's VM context.
module.exports = async () => {
  const platform = detectBrowserPlatform();
  if (!platform || platform === BrowserPlatform.LINUX_ARM) {
    return;
  }
  const options = {
    browser: 'chrome-headless-shell',
    buildId: CHROME_BUILD_ID,
    platform,
    cacheDir: path.join(process.cwd(), 'tests', '.chrome-cache'),
  };
  await install(options);
  process.env.PUPPETEER_EXECUTABLE_PATH = computeExecutablePath(options);
};
