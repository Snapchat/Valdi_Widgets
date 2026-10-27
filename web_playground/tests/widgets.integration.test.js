const {
  BASE_URL,
  TIMEOUT,
  BEFOREALL_TIMEOUT,
  launchBrowser,
  setupPageLogging,
  createErrorCollector,
  waitForValdiBootstrap,
  getTestStatus,
} = require('valdi-web-devtools/test_utils/puppeteer_helpers');
const { demoText, openDemo, waitForDemoText } = require('./demo_helpers');

// Text each demo is expected to render, keyed by DemoRegistry id.
const EXPECTED_TEXT = {
  buttons: 'CoreButton colorings',
  toggles: 'CoreJumboToggle',
  inputs: 'CoreTextField',
  cells: 'Ada Lovelace',
  cards: 'Tappable card with default shadow',
  motion: 'AnimationShimmer',
  pickers: 'IndexPicker',
  playground: 'Widgets Catalog',
};

describe('Valdi Widgets web playground', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await launchBrowser();
  }, BEFOREALL_TIMEOUT);

  afterAll(async () => {
    if (browser) await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    setupPageLogging(page);
  });

  afterEach(async () => {
    if (page) await page.close();
  });

  test('lists every registered demo in the nav', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: TIMEOUT });
    await waitForValdiBootstrap(page);
    const navIds = await page.$$eval('.nav a', links => links.map(link => link.dataset.demoId));
    const registryIds = await page.evaluate(() => window.__valdiWidgetsDemo.ids);
    expect(navIds).toEqual(registryIds);
    expect(registryIds.sort()).toEqual(Object.keys(EXPECTED_TEXT).sort());
  }, TIMEOUT);

  for (const [id, text] of Object.entries(EXPECTED_TEXT)) {
    test(`renders the ${id} demo without errors`, async () => {
      const errorCollector = createErrorCollector(page);
      await openDemo(page, id);

      const status = await getTestStatus(page);
      expect(status.valdiStatus).toBe('success');
      expect(status.bootstrapStatus.error).toBeNull();
      await waitForDemoText(page, text);

      const realErrors = errorCollector.getRealErrors();
      if (realErrors.length > 0) console.error(`Errors on ${id}:`, realErrors);
      expect(realErrors).toHaveLength(0);
    }, TIMEOUT);
  }

  test('switching demos replaces the mounted root', async () => {
    await openDemo(page, 'buttons');
    expect(await demoText(page)).toContain(EXPECTED_TEXT.buttons);
    await page.click('.nav a[data-demo-id="cards"]');
    await page.waitForFunction(() => window.__valdiWidgetsDemo.current === 'cards', { timeout: TIMEOUT });
    const text = await demoText(page);
    expect(text).toContain(EXPECTED_TEXT.cards);
    expect(text).not.toContain(EXPECTED_TEXT.buttons);
  }, TIMEOUT);
});
