import { FilePicker } from 'widgets/src/components/pickers/FilePicker';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';
import 'jasmine/src/jasmine';
import { createComponent } from 'valdi_test/test/JSXTestUtils';

describe('FilePicker', () => {
  it('exports FilePicker class', () => {
    expect(FilePicker).toBeDefined();
    expect(typeof FilePicker).toBe('function');
  });

  it('has onRender on prototype', () => {
    expect(FilePicker.prototype.onRender).toBeDefined();
  });

  it('renders a custom-view element', async () => {
    const component = createComponent(
      FilePicker,
      {},
      {},
    ).getComponent();

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    expect(elements.length).toBeGreaterThan(0);
  });

  it('renders with onSelect callback', async () => {
    const onSelect = jasmine.createSpy('onSelect');
    const component = createComponent(
      FilePicker,
      { onSelect },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    expect(elements.length).toBeGreaterThan(0);
  });

  it('renders with allowMultiple and accept', async () => {
    const component = createComponent(
      FilePicker,
      {
        onSelect: () => {},
        allowMultiple: true,
        accept: 'image/*',
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    expect(elements.length).toBeGreaterThan(0);
  });
});
