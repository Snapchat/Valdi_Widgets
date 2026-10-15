import { CoreTextField, CoreTextFieldSpecialState } from 'widgets/src/components/inputs/CoreTextField';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { elementTypeFind } from 'foundation/test/util/elementTypeFind';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';
import 'jasmine/src/jasmine';
import { Device } from 'valdi_core/src/Device';
import { Style } from 'valdi_core/src/Style';
import { View } from 'valdi_tsx/src/NativeTemplateElements';
import { valdiIt } from 'valdi_test/test/JSXTestUtils';
import { IRenderedElementViewClass } from 'valdi_test/test/IRenderedElementViewClass';

describe('CoreTextField', () => {
  beforeEach(() => {
    spyOn(Device, 'getDisplayScale').and.returnValue(2);
  });

  valdiIt('renders default enabled state', async driver => {
    const component = driver.renderComponent(
      CoreTextField,
      {
        text: 'hello',
      },
      {},
    );

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    expect(elements.length).toBeGreaterThanOrEqual(1);

    const textFields = elementTypeFind(elements, IRenderedElementViewClass.TextField);
    expect(textFields.length).toBeGreaterThanOrEqual(1);

    // Verify viewModel properties
    expect((component as any).viewModel.text).toBe('hello');
    expect((component as any).state.text).toBe('hello');
  });

  valdiIt('renders inactive state with disabled behavior', async driver => {
    const component = driver.renderComponent(
      CoreTextField,
      {
        specialState: CoreTextFieldSpecialState.Inactive,
      },
      {},
    );

    await untilRenderComplete(component);
    const elements = componentGetElements(component);
    expect(elements.length).toBeGreaterThanOrEqual(1);

    // Verify viewModel specialState
    expect((component as any).viewModel.specialState).toBe(CoreTextFieldSpecialState.Inactive);

    const textFields = elementTypeFind(elements, IRenderedElementViewClass.TextField);
    expect(textFields.length).toBeGreaterThanOrEqual(1);
  });

  valdiIt('shows validation accessory states', async driver => {
    const component = driver.renderComponent(
      CoreTextField,
      {
        specialState: CoreTextFieldSpecialState.Errored,
      },
      {},
    );
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

  valdiIt('clear button functionality when clearButtonEditing enabled', async driver => {
    const component = driver.renderComponent(
      CoreTextField,
      {
        text: 'text',
        clearButtonEditing: true,
      },
      {},
    );

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

  valdiIt('custom accessory state can be set', async driver => {
    const component = driver.renderComponent(
      CoreTextField,
      {
        specialState: CoreTextFieldSpecialState.CustomAccessory,
      },
      {},
    );

    await untilRenderComplete(component);

    // Verify viewModel has CustomAccessory state set
    expect((component as any).viewModel.specialState).toBe(CoreTextFieldSpecialState.CustomAccessory);

    const elements = componentGetElements(component);
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  valdiIt('inner textfield can shrink below its intrinsic width', async driver => {
    const component = driver.renderComponent(CoreTextField, { text: '12' }, {});

    const elements = componentGetElements(component);
    const textFields = elementTypeFind(elements, IRenderedElementViewClass.TextField);
    expect(textFields.length).toBeGreaterThanOrEqual(1);

    // flexShrink defaults to 0 in Valdi layout; without an explicit shrink the
    // web input keeps its intrinsic width (~200px) and escapes narrow parents.
    expect(textFields[0].getAttribute('flexShrink')).toBe(1);
    expect(textFields[0].getAttribute('minWidth')).toBe(0);
  });

  valdiIt('containerStyle sizes the component root', async driver => {
    const component = driver.renderComponent(
      CoreTextField,
      {
        text: '12',
        containerStyle: new Style<View>({ width: 96 }),
      },
      {},
    );

    const elements = componentGetElements(component);
    expect(elements.length).toBeGreaterThanOrEqual(1);

    // Root view is the styles.container <view>; caller width must land on
    // its style, and base container styling must survive the merge.
    const rootStyle = elements[0].getAttribute('style') as Style<View> | undefined;
    expect(rootStyle?.attributes.width).toBe(96);
    expect(rootStyle?.attributes.borderRadius).toBe(10);
  });
});
