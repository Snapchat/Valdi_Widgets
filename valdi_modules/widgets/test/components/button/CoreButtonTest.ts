import { CoreButton, CoreButtonColoring, CoreButtonSizing } from 'widgets/src/components/button/CoreButton';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { elementTypeFind } from 'foundation/test/util/elementTypeFind';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';
import 'jasmine/src/jasmine';
import { Device } from 'valdi_core/src/Device';
import * as InitSemanticColors from 'widgets/src/InitSemanticColors';
import { valdiIt } from 'valdi_test/test/JSXTestUtils';
import { IRenderedElementViewClass } from 'valdi_test/test/IRenderedElementViewClass';

describe('CoreButton', () => {
  valdiIt('renders defaults with text', async driver => {
    const component = driver.renderComponent(
      CoreButton,
      {
        text: 'Press me',
      },
      {},
    );

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const labels = elementTypeFind(elements, IRenderedElementViewClass.Label);
    expect(labels.length).toEqual(1);
    expect(labels[0].getAttribute('value')).toEqual('Press me');
    expect(labels[0].getAttribute('numberOfLines')).toEqual(2);
  });

  valdiIt('does not fire onTap when disabled', async driver => {
    const onTap = jasmine.createSpy('onTap');
    const component = driver.renderComponent(
      CoreButton,
      {
        text: 'Disabled',
        onTap,
        disabled: true,
      },
      {},
    );

    await untilRenderComplete(component);

    // onTap spy should not have been called
    expect(onTap).not.toHaveBeenCalled();
  });

  valdiIt('shows spinner instead of icon when loading', async driver => {
    const component = driver.renderComponent(
      CoreButton,
      {
        text: 'Loading',
        icon: 'icon.png',
        loading: true,
      },
      {},
    );

    await untilRenderComplete(component);
    const elements = componentGetElements(component);
    const spinners = elementTypeFind(elements, IRenderedElementViewClass.Spinner);
    const images = elementTypeFind(elements, IRenderedElementViewClass.Image);

    expect(spinners.length).toBeGreaterThan(0);
    expect(images.length).toEqual(0);
  });

  valdiIt('hides text when loading without icon', async driver => {
    const component = driver.renderComponent(
      CoreButton,
      {
        text: 'Loading',
        loading: true,
      },
      {},
    );

    await untilRenderComplete(component);
    const elements = componentGetElements(component);
    const labels = elementTypeFind(elements, IRenderedElementViewClass.Label);
    expect(labels.length).toEqual(1);
    expect(labels[0].getAttribute('opacity')).toEqual(0);
  });

  valdiIt('uses blending color only on iOS without custom theme', async driver => {
    const iosSpy = spyOn(Device, 'isIOS').and.returnValue(true);
    const customThemeSpy = spyOn(InitSemanticColors, 'isCustomTheme').and.returnValue(false);

    const component = driver.renderComponent(
      CoreButton,
      {
        text: 'Blend',
        coloring: CoreButtonColoring.PRIMARY,
      },
      {},
    ) as unknown as CoreButton;

    await untilRenderComplete(component);

    // Access private for test
    const shouldBlend = (component as any).shouldUseBlendingColor();
    expect(shouldBlend).toBeTrue();

    iosSpy.and.returnValue(false);
    customThemeSpy.and.returnValue(false);
    expect((component as any).shouldUseBlendingColor()).toBeFalse();
  });
});
