const {
  TIMEOUT,
  BEFOREALL_TIMEOUT,
  launchBrowser,
  setupPageLogging,
  createErrorCollector,
} = require('valdi-web-devtools/test_utils/puppeteer_helpers');
const { demoText, openDemo, waitForDemoText, waitForExactText, clickById, clickText } = require('./demo_helpers');

// Drives the widgets through the web renderer's input handling and checks that each one updates its demo's state.
describe('Valdi Widgets web interactions', () => {
  let browser;
  let page;
  let errorCollector;

  beforeAll(async () => {
    browser = await launchBrowser();
  }, BEFOREALL_TIMEOUT);

  afterAll(async () => {
    if (browser) await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    setupPageLogging(page);
    errorCollector = createErrorCollector(page);
  });

  afterEach(async () => {
    const realErrors = errorCollector ? errorCollector.getRealErrors() : [];
    if (page) await page.close();
    page = undefined;
    errorCollector = undefined;
    expect(realErrors).toHaveLength(0);
  });

  test('CoreButton taps update state', async () => {
    await openDemo(page, 'buttons');
    await waitForDemoText(page, 'Taps: 0');
    await clickById(page, 'core-button-primary');
    await waitForDemoText(page, 'Taps: 1');
    await clickById(page, 'core-button-secondary');
    await waitForDemoText(page, 'Taps: 2');
  }, TIMEOUT);

  test('PillButton and Checkbox change selection', async () => {
    await openDemo(page, 'buttons');
    await waitForDemoText(page, 'Showing: All');
    await clickById(page, 'pill-stories');
    await waitForDemoText(page, 'Showing: Stories');
    await waitForExactText(page, 'Unchecked');
    await clickById(page, 'checkbox');
    await waitForExactText(page, 'Checked');
  }, TIMEOUT);

  test('toggles, radios and selectors flip', async () => {
    await openDemo(page, 'toggles');
    await waitForExactText(page, 'On');
    await clickById(page, 'core-toggle');
    await waitForExactText(page, 'Off');
    await clickById(page, 'jumbo-toggle');
    await waitForDemoText(page, 'Jumbo: On');
    await clickById(page, 'radio-2');
    await waitForDemoText(page, 'Visible to: Only me');
    await waitForDemoText(page, '1 selected');
    await clickById(page, 'selector-1');
    await waitForDemoText(page, '2 selected');
  }, TIMEOUT);

  test('CoreTextField and SearchBox report typed text', async () => {
    await openDemo(page, 'inputs');
    await clickById(page, 'core-text-field');
    await page.keyboard.type('Valdi');
    await waitForDemoText(page, 'Hello, Valdi');
    await clickById(page, 'search-textfield');
    await page.keyboard.type('cats');
    await waitForDemoText(page, 'Query: cats');
  }, TIMEOUT);

  test('PillTextField adds a pill on return and removes one on tap', async () => {
    await openDemo(page, 'inputs');
    const input = await page.waitForSelector('pierce/input[placeholder="Add a name"]', { timeout: TIMEOUT });
    await input.click();
    await page.keyboard.type('Carol');
    await page.keyboard.press('Enter');
    await waitForDemoText(page, 'Carol');
    await clickText(page, 'Alice');
    await page.waitForFunction(
      () => !document.querySelector('.device > div').shadowRoot.textContent.includes('Alice'),
      { timeout: TIMEOUT },
    );
    expect(await demoText(page)).toContain('Bob');
  }, TIMEOUT);

  test('Card onTap fires', async () => {
    await openDemo(page, 'cards');
    await waitForDemoText(page, 'Tapped 0 times');
    await clickById(page, 'tappable-card');
    await waitForDemoText(page, 'Tapped 1 time');
  }, TIMEOUT);

  test('IndexPicker reports the chosen option', async () => {
    await openDemo(page, 'pickers');
    const select = await page.waitForSelector('pierce/select', { timeout: TIMEOUT });
    await select.select('1');
    await waitForDemoText(page, 'Selected: 🍌 Banana');
  }, TIMEOUT);

  test('PlaygroundApp navigates from the catalog to the main page', async () => {
    await openDemo(page, 'playground');
    await clickText(page, '← Back');
    await waitForDemoText(page, 'Themes');
    await clickText(page, 'Browse Widgets Catalog');
    await waitForExactText(page, '← Back');
    expect(await demoText(page)).not.toContain('Themes');
  }, TIMEOUT);
});
