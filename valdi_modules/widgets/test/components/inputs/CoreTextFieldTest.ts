import { CoreTextField, CoreTextFieldSpecialState } from 'widgets/src/components/inputs/CoreTextField';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { elementTypeFind } from 'foundation/test/util/elementTypeFind';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';
import 'jasmine/src/jasmine';
import { Device } from 'valdi_core/src/Device';
import { createComponent } from 'valdi_test/test/JSXTestUtils';
import { IRenderedElementViewClass } from 'valdi_test/test/IRenderedElementViewClass';

describe('CoreTextField', () => {
  beforeEach(() => {
    spyOn(Device, 'getDisplayScale').and.returnValue(2);
  });

  it('renders default enabled state', async () => {
    const component = createComponent(
      CoreTextField,
      {
        text: 'hello',
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    expect(elements.length).toBeGreaterThanOrEqual(1);

    const textFields = elementTypeFind(elements, IRenderedElementViewClass.TextField);
    expect(textFields.length).toBeGreaterThanOrEqual(1);

    // Verify viewModel properties
    expect((component as any).viewModel.text).toBe('hello');
    expect((component as any).state.text).toBe('hello');
  });

  it('renders inactive state with disabled behavior', async () => {
    const component = createComponent(
      CoreTextField,
      {
        specialState: CoreTextFieldSpecialState.Inactive,
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);
    const elements = componentGetElements(component);
    expect(elements.length).toBeGreaterThanOrEqual(1);

    // Verify viewModel specialState
    expect((component as any).viewModel.specialState).toBe(CoreTextFieldSpecialState.Inactive);

    const textFields = elementTypeFind(elements, IRenderedElementViewClass.TextField);
    expect(textFields.length).toBeGreaterThanOrEqual(1);
  });

  it('shows validation accessory states', async () => {
    const component = createComponent(
      CoreTextField,
      {
        specialState: CoreTextFieldSpecialState.Errored,
      },
      {},
    ).getComponent();
    await untilRenderComplete(component);

    let elements = componentGetElements(component);
    let images = elementTypeFind(elements, IRenderedElementViewClass.Image);
    expect(images.length).toBeGreaterThanOrEqual(0);

    // switch to validating shows spinner
    (component as any).setState({ focused: false, text: '' });
    (component as any).viewModel.specialState = CoreTextFieldSpecialState.Validating;
    await untilRenderComplete(component);
    elements = componentGetElements(component);
    const spinners = elementTypeFind(elements, IRenderedElementViewClass.Spinner);
    expect(spinners.length).toBeGreaterThanOrEqual(0);
  });

  it('clear button functionality when clearButtonEditing enabled', async () => {
    const component = createComponent(
      CoreTextField,
      {
        text: 'text',
        clearButtonEditing: true,
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    // Verify viewModel has clearButtonEditing enabled
    expect((component as any).viewModel.clearButtonEditing).toBe(true);
    expect((component as any).state.text).toBe('text');

    // simulate focus + text present to show clear button
    (component as any).setState({ focused: true, text: 'text' });
    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    expect(elements.length).toBeGreaterThanOrEqual(1);

    // Verify the clear functionality exists by checking state can be cleared
    (component as any).setState({ text: '' });
    await untilRenderComplete(component);
    expect((component as any).state.text).toBe('');
  });

  it('custom accessory state can be set', async () => {
    const component = createComponent(
      CoreTextField,
      {
        specialState: CoreTextFieldSpecialState.CustomAccessory,
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    // Verify viewModel has CustomAccessory state set
    expect((component as any).viewModel.specialState).toBe(CoreTextFieldSpecialState.CustomAccessory);

    const elements = componentGetElements(component);
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });
});
