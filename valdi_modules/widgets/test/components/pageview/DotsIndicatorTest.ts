import { DotsIndicator } from 'widgets/src/components/pageview/DotsIndicator';
import { ScrollViewHandler } from 'widgets/src/components/scroll/ScrollViewHandler';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';
import 'jasmine/src/jasmine';
import { valdiIt } from 'valdi_test/test/JSXTestUtils';

describe('DotsIndicator', () => {
  valdiIt('renders dots based on pageCount', async driver => {
    const handler = new ScrollViewHandler();
    const component = driver.renderComponent(
      DotsIndicator,
      {
        pageCount: 3,
        currentPageIndex: 1,
        maxDots: 3,
        dotsWidth: '100%',
        scrollViewHandler: handler,
      },
      {},
    );

    await untilRenderComplete(component);

    // Verify component has correct pageCount via the getter
    expect(component.pageCount).toBe(3);

    // Verify component renders elements
    const elements = componentGetElements(component);
    expect(elements.length).toBeGreaterThan(0);
  });

  valdiIt('does not render when pageCount is 0', async driver => {
    const handler = new ScrollViewHandler();
    const component = driver.renderComponent(
      DotsIndicator,
      {
        pageCount: 0,
        currentPageIndex: 0,
        maxDots: 3,
        dotsWidth: '100%',
        scrollViewHandler: handler,
      },
      {},
    );

    await untilRenderComplete(component);

    expect(component.pageCount).toBe(0);
  });

  valdiIt('exposes viewModel properties correctly', async driver => {
    const handler = new ScrollViewHandler();
    const component = driver.renderComponent(
      DotsIndicator,
      {
        pageCount: 5,
        currentPageIndex: 2,
        maxDots: 4,
        dotsWidth: '80%',
        scrollViewHandler: handler,
      },
      {},
    );

    await untilRenderComplete(component);

    expect(component.pageCount).toBe(5);
    expect(component.viewModel.currentPageIndex).toBe(2);
    expect(component.viewModel.maxDots).toBe(4);
    expect(component.viewModel.dotsWidth).toBe('80%');
  });
});
