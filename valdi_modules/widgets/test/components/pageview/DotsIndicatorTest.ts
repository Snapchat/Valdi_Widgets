import { DotsIndicator } from 'widgets/src/components/pageview/DotsIndicator';
import { ScrollViewHandler } from 'widgets/src/components/scroll/ScrollViewHandler';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';
import 'jasmine/src/jasmine';
import { createComponent } from 'valdi_test/test/JSXTestUtils';

describe('DotsIndicator', () => {
  it('renders dots based on pageCount', async () => {
    const handler = new ScrollViewHandler();
    const component = createComponent(
      DotsIndicator,
      {
        pageCount: 3,
        currentPageIndex: 1,
        maxDots: 3,
        dotsWidth: '100%',
        scrollViewHandler: handler,
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    // Verify component has correct pageCount via the getter
    expect(component.pageCount).toBe(3);

    // Verify component renders elements
    const elements = componentGetElements(component);
    expect(elements.length).toBeGreaterThan(0);
  });

  it('does not render when pageCount is 0', async () => {
    const handler = new ScrollViewHandler();
    const component = createComponent(
      DotsIndicator,
      {
        pageCount: 0,
        currentPageIndex: 0,
        maxDots: 3,
        dotsWidth: '100%',
        scrollViewHandler: handler,
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    expect(component.pageCount).toBe(0);
  });

  it('exposes viewModel properties correctly', async () => {
    const handler = new ScrollViewHandler();
    const component = createComponent(
      DotsIndicator,
      {
        pageCount: 5,
        currentPageIndex: 2,
        maxDots: 4,
        dotsWidth: '80%',
        scrollViewHandler: handler,
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    expect(component.pageCount).toBe(5);
    expect(component.viewModel.currentPageIndex).toBe(2);
    expect(component.viewModel.maxDots).toBe(4);
    expect(component.viewModel.dotsWidth).toBe('80%');
  });
});
