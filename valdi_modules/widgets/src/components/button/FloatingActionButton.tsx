import { AnimationCurve } from 'valdi_core/src/AnimationOptions';
import { StatefulComponent } from 'valdi_core/src/Component';
import { Device } from 'valdi_core/src/Device';
import { setTimeoutInterruptible } from 'valdi_core/src/SetTimeout';
import { Style } from 'valdi_core/src/Style';
import { Layout } from 'valdi_tsx/src/NativeTemplateElements';
import res from 'widgets/res';
import { isCustomTheme } from 'widgets/src/InitSemanticColors';
import { Theme, ThemeType } from 'widgets/src/Theme';
import { SemanticColor } from '../../styles/semanticColors';
import { CoreButton, CoreButtonSizing, sizingOptions } from './CoreButton';

export interface FloatingActionButtonViewModel {
  visible: boolean;
  sizing?: CoreButtonSizing;
  onTap?: VoidFunction;
}

export interface FloatingActionButtonContext {
  themeType?: Theme.Type;
}

interface FloatingActionButtonState {
  marginBottom: number;
  backgroundColor: string;
  foregroundColor: string;
}

interface FloatingActionButtonColorTheme {
  background: SemanticColor;
  backgroundDown: SemanticColor;
  icon: SemanticColor;
}

export class FloatingActionButton extends StatefulComponent<
  FloatingActionButtonViewModel,
  FloatingActionButtonState,
  FloatingActionButtonContext
> {
  private static readonly backgroundColorAnimationOptions = { duration: 0.125, curve: AnimationCurve.EaseInOut };
  readonly theme = Theme.from(this.context.themeType);
  readonly colorThemes = {
    light: {
      background: this.theme.applyTo(SemanticColor.Icon.PRIMARY),
      backgroundDown: this.theme.applyTo(SemanticColor.Icon.SECONDARY),
      icon: this.theme.applyTo(SemanticColor.Text.ON_PRIMARY_BUTTON),
    },
    dark: {
      background: this.theme.applyTo(SemanticColor.Text.ON_PRIMARY_BUTTON),
      backgroundDown: this.theme.applyTo(SemanticColor.Icon.PRIMARY),
      icon: isCustomTheme() ? SemanticColor.Button.PRIMARY : this.theme.applyTo(SemanticColor.Button.SECONDARY),
    },
  };
  state = {
    marginBottom: this.getMargins(true).marginBottom,
    backgroundColor: this.getColorTheme().background,
    foregroundColor: this.getColorTheme().icon,
  };

  private timer?: number;

  private readonly containerStyle = new Style<Layout>({
    position: 'absolute',
    bottom: 0,
    right: 0,
    marginRight: this.getMargins(true).marginRight,
  });

  private readonly darkModeObserver = Device.observeDarkMode(() => {
    this.setState({
      backgroundColor: this.getColorTheme().background,
      foregroundColor: this.getColorTheme().icon,
    });
  });

  onViewModelUpdate(previousViewModel?: FloatingActionButtonViewModel): void {
    const updatedState = {
      marginBottom: this.getMargins(this.viewModel.visible).marginBottom,
    };
    if (previousViewModel === undefined) {
      this.setState(updatedState);
      return;
    }
    const visiblityChanged = previousViewModel.visible !== this.viewModel.visible;
    if (visiblityChanged) {
      clearTimeout(this.timer);
      this.timer = setTimeoutInterruptible(() => {
        this.setStateAnimated(updatedState, {
          duration: 0.1,
          curve: this.viewModel.visible ? AnimationCurve.EaseOut : AnimationCurve.EaseIn,
        });
      });
    }
  }

  onRender(): void {
    <view
      style={this.containerStyle}
      marginBottom={this.state.marginBottom}
      boxShadow={'complex 0 4 8 rgba(0, 0, 0, 0.2)'}
      id='floatingSearchButton'
    >
      <CoreButton
        icon={res.iconMagnifyingGlass24}
        circular={true}
        foregroundColor={this.state.foregroundColor}
        backgroundColor={this.state.backgroundColor}
        sizing={this.getButtonSize()}
        iconRespectSize={true}
        onTap={this.viewModel.onTap}
        onTouchStart={this.onTouchStart}
        onTouchEnd={this.onTouchEnd}
      />
    </view>;
  }

  onDestroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.darkModeObserver.cancel();
  }

  private onTouchStart = (): void => {
    this.setStateAnimated(
      { backgroundColor: this.getColorTheme().backgroundDown },
      FloatingActionButton.backgroundColorAnimationOptions,
    );
  };
  private onTouchEnd = (): void => {
    this.setStateAnimated(
      { backgroundColor: this.getColorTheme().background },
      FloatingActionButton.backgroundColorAnimationOptions,
    );
  };

  private getColorTheme(): FloatingActionButtonColorTheme {
    switch (this.context.themeType) {
      case ThemeType.LIGHT:
        return this.colorThemes.light;
      case ThemeType.DARK:
        return this.colorThemes.dark;
      case ThemeType.SYSTEM:
      default:
        return Device.isDarkMode() ? this.colorThemes.dark : this.colorThemes.light;
    }
  }

  private getMargins(isVisible: boolean): { marginBottom: number; marginRight: number } {
    const smallDeviceMargin = 16;
    const tallDeviceMargin = 24;
    const buttonHeight = sizingOptions[this.getButtonSize()].minHeight;
    if (Device.isIOS() && this.getIsTallDevice()) {
      /**
       * On 'tall' devices, (ie: iPhone X, iPhone XR, iPhone 11 Pro Max, etc) we want draw inside the
       * bottom inset area so that the button is 'nestled' neatly in the corner. To detect these device
       * types, we can check the aspect ratio.
       */
      return {
        marginBottom: isVisible ? tallDeviceMargin : -buttonHeight,
        marginRight: tallDeviceMargin,
      };
    }

    return {
      marginBottom: isVisible ? Device.getDisplayBottomInset() + smallDeviceMargin : -buttonHeight,
      marginRight: Device.getDisplayRightInset() + smallDeviceMargin,
    };
  }

  private getButtonSize(): CoreButtonSizing {
    return this.viewModel.sizing || CoreButtonSizing.XL;
  }

  private getIsTallDevice(): boolean {
    return this.getDeviceAspectRatio() > 2.1;
  }

  private getDeviceAspectRatio(): number {
    return Device.getDisplayHeight() / Device.getDisplayWidth();
  }
}
