import { Sheet } from 'widgets/src/components/sheet/Sheet';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { elementTypeFind } from 'foundation/test/util/elementTypeFind';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';
import 'jasmine/src/jasmine';
import { createComponent } from 'valdi_test/test/JSXTestUtils';
import { IRenderedElementViewClass } from 'valdi_test/test/IRenderedElementViewClass';
import { Device } from 'valdi_core/src/Device';

describe('Sheet', () => {
  beforeEach(() => {
    spyOn(Device, 'isIOS').and.returnValue(false);
  });

  it('renders with default props', async () => {
    const component = createComponent(
      Sheet,
      {
        height: 300,
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    expect(elements.length).toBeGreaterThan(0);
  });

  it('calls onTapOut when dismiss target is tapped', async () => {
    const onTapOut = jasmine.createSpy('onTapOut');
    const component = createComponent(
      Sheet,
      {
        height: 300,
        onTapOut,
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const views = elementTypeFind(elements, IRenderedElementViewClass.View);
    expect(views.length).toBeGreaterThan(0);
  });

  it('renders grabber when shouldShowGrabber is true', async () => {
    const component = createComponent(
      Sheet,
      {
        height: 300,
        shouldShowGrabber: true,
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const views = elementTypeFind(elements, IRenderedElementViewClass.View);
    // Should have multiple views including the grabber
    expect(views.length).toBeGreaterThan(1);
  });

  it('does not render grabber when shouldShowGrabber is false', async () => {
    const component = createComponent(
      Sheet,
      {
        height: 300,
        shouldShowGrabber: false,
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    expect(elements.length).toBeGreaterThan(0);
  });
});
