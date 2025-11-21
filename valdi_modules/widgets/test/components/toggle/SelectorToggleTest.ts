import { SelectorToggle } from 'widgets/src/components/toggle/SelectorToggle';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { elementTypeFind } from 'foundation/test/util/elementTypeFind';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';
import 'jasmine/src/jasmine';
import { createComponent } from 'valdi_test/test/JSXTestUtils';
import { IRenderedElementViewClass } from 'valdi_test/test/IRenderedElementViewClass';

describe('SelectorToggle', () => {
  it('renders inactive state with border and no icon', async () => {
    const component = createComponent(
      SelectorToggle,
      {
        on: false,
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const root = elements[0];
    expect(root.getAttribute('borderWidth')).toBe(1);
    expect(root.getAttribute('accessibilityStateSelected')).toBe(false);

    const images = elementTypeFind(elements, IRenderedElementViewClass.Image);
    expect(images.length).toBe(1);
    expect(images[0].getAttribute('src')).toBeUndefined();
  });

  it('renders active state with check icon and no border', async () => {
    const component = createComponent(
      SelectorToggle,
      {
        on: true,
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const root = elements[0];
    expect(root.getAttribute('borderWidth')).toBeUndefined();
    expect(root.getAttribute('accessibilityStateSelected')).toBe(true);

    const images = elementTypeFind(elements, IRenderedElementViewClass.Image);
    expect(images.length).toBe(1);
    expect(images[0].getAttribute('src')).toBeDefined();
  });
});
