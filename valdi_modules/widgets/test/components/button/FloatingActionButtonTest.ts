import { FloatingActionButton } from 'widgets/src/components/button/FloatingActionButton';
import { CoreButtonSizing } from 'widgets/src/components/button/CoreButton';
import { ThemeType } from 'widgets/src/Theme';
import 'jasmine/src/jasmine';
import { Device } from 'valdi_core/src/Device';
import { createComponent } from 'valdi_test/test/JSXTestUtils';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';

describe('FloatingActionButton', () => {
  beforeEach(() => {
    spyOn(Device, 'isDarkMode').and.returnValue(false);
    spyOn(Device, 'isIOS').and.returnValue(false);
    spyOn(Device, 'getDisplayBottomInset').and.returnValue(0);
    spyOn(Device, 'getDisplayRightInset').and.returnValue(0);
    spyOn(Device, 'getDisplayHeight').and.returnValue(800);
    spyOn(Device, 'getDisplayWidth').and.returnValue(400);
  });

  it('renders when visible', async () => {
    const component = createComponent(
      FloatingActionButton,
      {
        visible: true,
      },
      {
        themeType: ThemeType.LIGHT,
      },
    ).getComponent();

    await untilRenderComplete(component);
    expect(component).toBeDefined();
  });

  it('renders when not visible', async () => {
    const component = createComponent(
      FloatingActionButton,
      {
        visible: false,
      },
      {
        themeType: ThemeType.LIGHT,
      },
    ).getComponent() as unknown as FloatingActionButton;

    await untilRenderComplete(component);
    expect(component).toBeDefined();
  });

  it('returns sizing override when provided', async () => {
    const component = createComponent(
      FloatingActionButton,
      {
        visible: true,
        sizing: CoreButtonSizing.SMALL,
      },
      {
        themeType: ThemeType.LIGHT,
      },
    ).getComponent() as unknown as FloatingActionButton;

    await untilRenderComplete(component);

    expect((component as any).getButtonSize()).toBe(CoreButtonSizing.SMALL);
  });

  it('dark mode theme picks dark palette', async () => {
    (Device.isDarkMode as jasmine.Spy).and.returnValue(true);
    const component = createComponent(
      FloatingActionButton,
      {
        visible: true,
      },
      {
        themeType: ThemeType.SYSTEM,
      },
    ).getComponent() as unknown as FloatingActionButton;

    await untilRenderComplete(component);

    const colors = (component as any).getColorTheme();
    expect(colors.background).toEqual((component as any).colorThemes.dark.background);
  });
});
