import { Checkbox } from 'widgets/src/components/button/Checkbox';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { elementTypeFind } from 'foundation/test/util/elementTypeFind';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';
import 'jasmine/src/jasmine';
import { valdiIt } from 'valdi_test/test/JSXTestUtils';
import { IRenderedElementViewClass } from 'valdi_test/test/IRenderedElementViewClass';

describe('Checkbox', () => {
  valdiIt('renders unchecked with border and no tick', async driver => {
    const onTap = jasmine.createSpy('onTap');
    const component = driver.renderComponent(
      Checkbox,
      {
        on: false,
        onTap,
      },
      {},
    );

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const root = elements[0];
    expect(root.getAttribute('backgroundColor')).toBeUndefined();
    expect(root.getAttribute('borderWidth')).toBe(1);

    const images = elementTypeFind(elements, IRenderedElementViewClass.Image);
    expect(images.length).toBe(0);
  });

  valdiIt('renders checked with tick and no border', async driver => {
    const component = driver.renderComponent(
      Checkbox,
      {
        on: true,
        onTap: () => {},
      },
      {},
    );

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const root = elements[0];
    expect(root.getAttribute('backgroundColor')).toBeDefined();
    expect(root.getAttribute('borderWidth')).toBe(0);

    const images = elementTypeFind(elements, IRenderedElementViewClass.Image);
    expect(images.length).toBe(1);
  });

  valdiIt('does not toggle when disabled', async driver => {
    const onTap = jasmine.createSpy('onTap');
    const component = driver.renderComponent(
      Checkbox,
      {
        on: false,
        onTap,
        disabled: true,
      },
      {},
    ) as unknown as Checkbox;

    await untilRenderComplete(component);

    (component as any).onTap();
    expect(onTap).not.toHaveBeenCalled();
  });
});
