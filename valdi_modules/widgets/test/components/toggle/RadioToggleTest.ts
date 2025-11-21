import { RadioToggle } from 'widgets/src/components/toggle/RadioToggle';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { elementTypeFind } from 'foundation/test/util/elementTypeFind';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';
import 'jasmine/src/jasmine';
import { createComponent } from 'valdi_test/test/JSXTestUtils';
import { IRenderedElementViewClass } from 'valdi_test/test/IRenderedElementViewClass';

describe('RadioToggle', () => {
  it('renders inactive state with larger inner circle', async () => {
    const component = createComponent(
      RadioToggle,
      {
        on: false,
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const root = elements[0];
    expect(root.getAttribute('accessibilityStateSelected')).toBe(false);

    const views = elementTypeFind(elements, IRenderedElementViewClass.View);
    const [outer, inner] = views;
    expect(inner.getAttribute('width')).toBeGreaterThan(10); // inactive uses OUTER_SIZE-2
  });

  it('renders active state with small inner dot', async () => {
    const component = createComponent(
      RadioToggle,
      {
        on: true,
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const root = elements[0];
    expect(root.getAttribute('accessibilityStateSelected')).toBe(true);

    const views = elementTypeFind(elements, IRenderedElementViewClass.View);
    const [, inner] = views;
    expect(inner.getAttribute('width')).toBeCloseTo(10, 1);
    expect(inner.getAttribute('height')).toBeCloseTo(10, 1);
  });
});
