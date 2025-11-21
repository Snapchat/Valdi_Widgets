import { SectionBody } from 'widgets/src/components/section/SectionBody';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { elementTypeFind } from 'foundation/test/util/elementTypeFind';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';
import 'jasmine/src/jasmine';
import { createComponent } from 'valdi_test/test/JSXTestUtils';
import { IRenderedElementViewClass } from 'valdi_test/test/IRenderedElementViewClass';
import { Subscreen } from 'widgets/src/components/subscreen/Subscreen';

describe('SectionBody', () => {
  it('renders with default padding', async () => {
    const component = createComponent(
      SectionBody,
      {},
      {},
    ).getComponent();

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const layouts = elementTypeFind(elements, IRenderedElementViewClass.Layout);
    expect(layouts.length).toBeGreaterThan(0);
    // The root layout should have GUTTER_SIZE padding
    const root = layouts.find(l => l.getAttribute('paddingLeft') === Subscreen.GUTTER_SIZE);
    expect(root).toBeDefined();
    expect(root?.getAttribute('paddingRight')).toBe(Subscreen.GUTTER_SIZE);
  });

  it('renders without padding when fullBleed is true', async () => {
    const component = createComponent(
      SectionBody,
      {
        fullBleed: true,
      },
      {},
    ).getComponent();

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
