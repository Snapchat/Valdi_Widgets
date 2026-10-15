import { FilePicker } from 'widgets/src/components/pickers/FilePicker';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';
import 'jasmine/src/jasmine';
import { valdiIt } from 'valdi_test/test/JSXTestUtils';

describe('FilePicker', () => {
  it('exports FilePicker class', () => {
    expect(FilePicker).toBeDefined();
    expect(typeof FilePicker).toBe('function');
  });

  it('has onRender on prototype', () => {
    expect(FilePicker.prototype.onRender).toBeDefined();
  });

  valdiIt('renders a custom-view element', async driver => {
    const component = driver.renderComponent(
      FilePicker,
      {},
      {},
    );

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    expect(elements.length).toBeGreaterThan(0);
  });

  valdiIt('renders with onSelect callback', async driver => {
    const onSelect = jasmine.createSpy('onSelect');
    const component = driver.renderComponent(
      FilePicker,
      { onSelect },
      {},
    );

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    expect(elements.length).toBeGreaterThan(0);
  });

  valdiIt('renders with allowMultiple and accept', async driver => {
    const component = driver.renderComponent(
      FilePicker,
      {
        onSelect: () => {},
        allowMultiple: true,
        accept: 'image/*',
      },
      {},
    );

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    expect(elements.length).toBeGreaterThan(0);
  });
});
