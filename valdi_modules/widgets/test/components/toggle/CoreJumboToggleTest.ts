import { CoreJumboToggle } from 'widgets/src/components/toggle/CoreJumboToggle';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { elementTypeFind } from 'foundation/test/util/elementTypeFind';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';
import 'jasmine/src/jasmine';
import { createComponent } from 'valdi_test/test/JSXTestUtils';
import { IRenderedElementViewClass } from 'valdi_test/test/IRenderedElementViewClass';

describe('CoreJumboToggle', () => {
  it('renders enabled off state with default sizing and touch enabled', async () => {
    const component = createComponent(
      CoreJumboToggle,
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

  it('renders disabled on state with reduced opacity and selected state', async () => {
    const component = createComponent(
      CoreJumboToggle,
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

  it('selects correct image/tint per state', async () => {
    const offSrc = 'off.png';
    const onSrc = 'on.png';
    const component = createComponent(
      CoreJumboToggle,
      {
        on: false,
        offImage: offSrc,
        onImage: onSrc,
        offImageTintColor: 'gray',
        onImageTintColor: 'green',
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    let elements = componentGetElements(component);
    let images = elementTypeFind(elements, IRenderedElementViewClass.Image);
    expect(images.length).toBe(1);
    expect(images[0].getAttribute('src')).toBe(offSrc);
    expect(images[0].getAttribute('tint')).toBe('gray');

    // flip state and force render update
    (component as any).setState({ on: true });
    await untilRenderComplete(component);

    elements = componentGetElements(component);
    images = elementTypeFind(elements, IRenderedElementViewClass.Image);
    expect(images[0].getAttribute('src')).toBe(onSrc);
    expect(images[0].getAttribute('tint')).toBe('green');
  });
});
