import { CoreToggle } from 'widgets/src/components/toggle/CoreToggle';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { elementTypeFind } from 'foundation/test/util/elementTypeFind';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';
import 'jasmine/src/jasmine';
import { createComponent } from 'valdi_test/test/JSXTestUtils';
import { IRenderedElementViewClass } from 'valdi_test/test/IRenderedElementViewClass';

describe('CoreToggle', () => {
  it('renders default enabled state with proper accessibility flags', async () => {
    const component = createComponent(
      CoreToggle,
      {
        on: false,
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const root = elements[0];
    expect(root.getAttribute('touchEnabled')).toBe(true);
    expect(root.getAttribute('touchAreaExtension')).toBe(10);
    expect(root.getAttribute('accessibilityStateSelected')).toBe(false);
    expect(root.getAttribute('opacity')).toBeUndefined();
  });

  it('disables touch and lowers opacity when disabled', async () => {
    const component = createComponent(
      CoreToggle,
      {
        on: true,
        disabled: true,
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    const root = componentGetElements(component)[0];
    expect(root.getAttribute('touchEnabled')).toBe(false);
    expect(root.getAttribute('opacity')).toBeCloseTo(0.38, 2);
    expect(root.getAttribute('accessibilityStateSelected')).toBe(true);
  });

  it('shows pressed shade during touch interaction', async () => {
    const component = createComponent(
      CoreToggle,
      {
        on: false,
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const root = elements[0];
    const onTouchStart = root.getAttribute('onTouchStart') as (() => void) | undefined;
    const onTouchEnd = root.getAttribute('onTouchEnd') as (() => void) | undefined;
    expect(onTouchStart).toBeDefined();
    expect(onTouchEnd).toBeDefined();

    onTouchStart?.();
    await untilRenderComplete(component);

    const views = elementTypeFind(elements, IRenderedElementViewClass.View);
    const shade = views.find(view => view.getAttribute('opacity') !== undefined);
    expect(shade?.getAttribute('opacity')).toBeCloseTo(0.5, 2);

    onTouchEnd?.();
    await untilRenderComplete(component);
    expect(shade?.getAttribute('opacity')).toBeCloseTo(0, 2);
  });
});
