import { Checkbox } from 'widgets/src/components/button/Checkbox';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { elementTypeFind } from 'foundation/test/util/elementTypeFind';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';
import 'jasmine/src/jasmine';
import { createComponent } from 'valdi_test/test/JSXTestUtils';
import { IRenderedElementViewClass } from 'valdi_test/test/IRenderedElementViewClass';

describe('Checkbox', () => {
  it('renders unchecked with border and no tick', async () => {
    const onTap = jasmine.createSpy('onTap');
    const component = createComponent(
      Checkbox,
      {
        on: false,
        onTap,
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const root = elements[0];
    expect(root.getAttribute('backgroundColor')).toBeUndefined();
    expect(root.getAttribute('borderWidth')).toBe(1);

    const images = elementTypeFind(elements, IRenderedElementViewClass.Image);
    expect(images.length).toBe(0);
  });

  it('renders checked with tick and no border', async () => {
    const component = createComponent(
      Checkbox,
      {
        on: true,
        onTap: () => {},
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const root = elements[0];
    expect(root.getAttribute('backgroundColor')).toBeDefined();
    expect(root.getAttribute('borderWidth')).toBe(0);

    const images = elementTypeFind(elements, IRenderedElementViewClass.Image);
    expect(images.length).toBe(1);
  });

  it('does not toggle when disabled', async () => {
    const onTap = jasmine.createSpy('onTap');
    const component = createComponent(
      Checkbox,
      {
        on: false,
        onTap,
        disabled: true,
      },
      {},
    ).getComponent() as unknown as Checkbox;

    await untilRenderComplete(component);

    (component as any).onTap();
    expect(onTap).not.toHaveBeenCalled();
  });
});
