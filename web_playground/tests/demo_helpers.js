const { BASE_URL, TIMEOUT, waitForValdiBootstrap } = require('valdi-web-devtools/test_utils/puppeteer_helpers');

// The mounted demo renders into the shadow root of the host element inside `.device`.
async function demoText(page) {
  return page.evaluate(() => {
    const host = document.querySelector('.device > div');
    return host && host.shadowRoot ? host.shadowRoot.textContent || '' : null;
  });
}

async function openDemo(page, id) {
  await page.goto(`${BASE_URL}/#/${id}`, { waitUntil: 'networkidle2', timeout: TIMEOUT });
  await waitForValdiBootstrap(page);
  await page.waitForFunction(
    demoId => window.__valdiWidgetsDemo && window.__valdiWidgetsDemo.current === demoId,
    { timeout: TIMEOUT },
    id,
  );
}

async function waitForDemoText(page, text) {
  await page.waitForFunction(
    expected => {
      const host = document.querySelector('.device > div');
      return host && host.shadowRoot && (host.shadowRoot.textContent || '').includes(expected);
    },
    { timeout: TIMEOUT },
    text,
  );
}

// Waits for an element whose own text is exactly `text`, for states whose label is a substring of another label.
async function waitForExactText(page, text) {
  await page.waitForFunction(
    expected => {
      const host = document.querySelector('.device > div');
      if (!host || !host.shadowRoot) return false;
      const walker = document.createTreeWalker(host.shadowRoot, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (node.textContent.trim() === expected) return true;
      }
      return false;
    },
    { timeout: TIMEOUT },
    text,
  );
}

// Valdi renders accessibilityId as the element id; `pierce/` reaches into the demo's shadow root.
async function clickById(page, id) {
  const element = await page.waitForSelector(`pierce/#${id}`, { timeout: TIMEOUT });
  await element.click();
}

// For widgets that don't take an accessibilityId: clicks the element whose own text is exactly `text`.
async function clickText(page, text) {
  const handle = await page.waitForFunction(
    expected => {
      const host = document.querySelector('.device > div');
      if (!host || !host.shadowRoot) return null;
      const walker = document.createTreeWalker(host.shadowRoot, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (node.textContent.trim() === expected) return node.parentElement;
      }
      return null;
    },
    { timeout: TIMEOUT },
    text,
  );
  await handle.asElement().click();
}

module.exports = { demoText, openDemo, waitForDemoText, waitForExactText, clickById, clickText };
