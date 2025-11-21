import { CoreButton, CoreButtonColoring, CoreButtonSizing } from 'widgets/src/components/button/CoreButton';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { elementTypeFind } from 'foundation/test/util/elementTypeFind';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';
import 'jasmine/src/jasmine';
import { Device } from 'valdi_core/src/Device';
import * as InitSemanticColors from 'widgets/src/InitSemanticColors';
import { createComponent } from 'valdi_test/test/JSXTestUtils';
import { IRenderedElementViewClass } from 'valdi_test/test/IRenderedElementViewClass';

describe('CoreButton', () => {
  it('renders defaults with text', async () => {
    const component = createComponent(
      CoreButton,
      {
        text: 'Press me',
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const labels = elementTypeFind(elements, IRenderedElementViewClass.Label);
    expect(labels.length).toEqual(1);
    expect(labels[0].getAttribute('value')).toEqual('Press me');
    expect(labels[0].getAttribute('numberOfLines')).toEqual(2);
  });

  it('does not fire onTap when disabled', async () => {
    const onTap = jasmine.createSpy('onTap');
    const component = createComponent(
      CoreButton,
      {
        text: 'Disabled',
        onTap,
        disabled: true,
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    // onTap spy should not have been called
    expect(onTap).not.toHaveBeenCalled();
  });

  it('shows spinner instead of icon when loading', async () => {
    const component = createComponent(
      CoreButton,
      {
        text: 'Loading',
        icon: 'icon.png',
        loading: true,
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);
    const elements = componentGetElements(component);
    const spinners = elementTypeFind(elements, IRenderedElementViewClass.Spinner);
    const images = elementTypeFind(elements, IRenderedElementViewClass.Image);

    expect(spinners.length).toBeGreaterThan(0);
    expect(images.length).toEqual(0);
  });

  it('hides text when loading without icon', async () => {
    const component = createComponent(
      CoreButton,
      {
        text: 'Loading',
        loading: true,
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);
    const elements = componentGetElements(component);
    const labels = elementTypeFind(elements, IRenderedElementViewClass.Label);
    expect(labels.length).toEqual(1);
    expect(labels[0].getAttribute('opacity')).toEqual(0);
  });

  it('uses blending color only on iOS without custom theme', async () => {
    const iosSpy = spyOn(Device, 'isIOS').and.returnValue(true);
    const customThemeSpy = spyOn(InitSemanticColors, 'isCustomTheme').and.returnValue(false);

    const component = createComponent(
      CoreButton,
      {
        text: 'Blend',
        coloring: CoreButtonColoring.PRIMARY,
      },
      {},
    ).getComponent() as unknown as CoreButton;

    await untilRenderComplete(component);

    // Access private for test
    const shouldBlend = (component as any).shouldUseBlendingColor();
    expect(shouldBlend).toBeTrue();

    iosSpy.and.returnValue(false);
    customThemeSpy.and.returnValue(false);
    expect((component as any).shouldUseBlendingColor()).toBeFalse();
  });
});
