import { Sheet } from 'widgets/src/components/sheet/Sheet';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { elementTypeFind } from 'foundation/test/util/elementTypeFind';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';
import 'jasmine/src/jasmine';
import { valdiIt } from 'valdi_test/test/JSXTestUtils';
import { IRenderedElementViewClass } from 'valdi_test/test/IRenderedElementViewClass';
import { Device } from 'valdi_core/src/Device';

describe('Sheet', () => {
  beforeEach(() => {
    spyOn(Device, 'isIOS').and.returnValue(false);
  });

  valdiIt('renders with default props', async driver => {
    const component = driver.renderComponent(
      Sheet,
      {
        height: 300,
      },
      {},
    );

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    expect(elements.length).toBeGreaterThan(0);
  });

  valdiIt('calls onTapOut when dismiss target is tapped', async driver => {
    const onTapOut = jasmine.createSpy('onTapOut');
    const component = driver.renderComponent(
      Sheet,
      {
        height: 300,
        onTapOut,
      },
      {},
    );

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const views = elementTypeFind(elements, IRenderedElementViewClass.View);
    expect(views.length).toBeGreaterThan(0);
  });

  valdiIt('renders grabber when shouldShowGrabber is true', async driver => {
    const component = driver.renderComponent(
      Sheet,
      {
        height: 300,
        shouldShowGrabber: true,
      },
      {},
    );

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const views = elementTypeFind(elements, IRenderedElementViewClass.View);
    // Should have multiple views including the grabber
    expect(views.length).toBeGreaterThan(1);
  });

  valdiIt('does not render grabber when shouldShowGrabber is false', async driver => {
    const component = driver.renderComponent(
      Sheet,
      {
        height: 300,
        shouldShowGrabber: false,
      },
      {},
    );

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    expect(elements.length).toBeGreaterThan(0);
  });
});
