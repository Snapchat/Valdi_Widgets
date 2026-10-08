import { SectionBody } from 'widgets/src/components/section/SectionBody';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { elementTypeFind } from 'foundation/test/util/elementTypeFind';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';
import 'jasmine/src/jasmine';
import { valdiIt } from 'valdi_test/test/JSXTestUtils';
import { IRenderedElementViewClass } from 'valdi_test/test/IRenderedElementViewClass';
import { Subscreen } from 'widgets/src/components/subscreen/Subscreen';

describe('SectionBody', () => {
  valdiIt('renders with default padding', async driver => {
    const component = driver.renderComponent(
      SectionBody,
      {},
      {},
    );

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const layouts = elementTypeFind(elements, IRenderedElementViewClass.Layout);
    expect(layouts.length).toBeGreaterThan(0);
    // The root layout should have GUTTER_SIZE padding
    const root = layouts.find(l => l.getAttribute('paddingLeft') === Subscreen.GUTTER_SIZE);
    expect(root).toBeDefined();
    expect(root?.getAttribute('paddingRight')).toBe(Subscreen.GUTTER_SIZE);
  });

  valdiIt('renders without padding when fullBleed is true', async driver => {
    const component = driver.renderComponent(
      SectionBody,
      {
        fullBleed: true,
      },
      {},
    );

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const layouts = elementTypeFind(elements, IRenderedElementViewClass.Layout);
    expect(layouts.length).toBeGreaterThan(0);
    // The root layout should have 0 padding when fullBleed
    const root = layouts.find(l => l.getAttribute('paddingLeft') === 0);
    expect(root).toBeDefined();
    expect(root?.getAttribute('paddingRight')).toBe(0);
  });
});
