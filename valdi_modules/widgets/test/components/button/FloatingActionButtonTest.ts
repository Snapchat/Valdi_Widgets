import { FloatingActionButton } from 'widgets/src/components/button/FloatingActionButton';
import { CoreButtonSizing } from 'widgets/src/components/button/CoreButton';
import { ThemeType } from 'widgets/src/Theme';
import 'jasmine/src/jasmine';
import { Device } from 'valdi_core/src/Device';
import { valdiIt } from 'valdi_test/test/JSXTestUtils';
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

  valdiIt('renders when visible', async driver => {
    const component = driver.renderComponent(
      FloatingActionButton,
      {
        visible: true,
      },
      {
        themeType: ThemeType.LIGHT,
      },
    );

    await untilRenderComplete(component);
    expect(component).toBeDefined();
  });

  valdiIt('renders when not visible', async driver => {
    const component = driver.renderComponent(
      FloatingActionButton,
      {
        visible: false,
      },
      {
        themeType: ThemeType.LIGHT,
      },
    ) as unknown as FloatingActionButton;

    await untilRenderComplete(component);
    expect(component).toBeDefined();
  });

  valdiIt('returns sizing override when provided', async driver => {
    const component = driver.renderComponent(
      FloatingActionButton,
      {
        visible: true,
        sizing: CoreButtonSizing.SMALL,
      },
      {
        themeType: ThemeType.LIGHT,
      },
    ) as unknown as FloatingActionButton;

    await untilRenderComplete(component);

    expect((component as any).getButtonSize()).toBe(CoreButtonSizing.SMALL);
  });

  valdiIt('dark mode theme picks dark palette', async driver => {
    (Device.isDarkMode as jasmine.Spy).and.returnValue(true);
    const component = driver.renderComponent(
      FloatingActionButton,
      {
        visible: true,
      },
      {
        themeType: ThemeType.SYSTEM,
      },
    ) as unknown as FloatingActionButton;

    await untilRenderComplete(component);

    const colors = (component as any).getColorTheme();
    expect(colors.background).toEqual((component as any).colorThemes.dark.background);
  });
});
