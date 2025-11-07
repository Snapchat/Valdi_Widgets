import { SPRING_DEFAULT_STIFFNESS, SPRING_DEFAULT_DAMPING } from 'valdi_core/src/AnimationOptions';
import { Asset } from 'valdi_core/src/Asset';
import { StatefulComponent } from 'valdi_core/src/Component';
import { Device } from 'valdi_core/src/Device';
import { DeviceHapticFeedbackType } from 'valdi_core/src/DeviceBridge';
import { setTimeoutInterruptible } from 'valdi_core/src/SetTimeout';
import { Style } from 'valdi_core/src/Style';
import { when } from 'valdi_core/src/utils/When';
import { View, Layout } from 'valdi_tsx/src/NativeTemplateElements';
import { alwaysLight, SemanticColor } from 'widgets/src/styles/semanticColors';

const TRACK_ACTIVE_COLOR = SemanticColor.Brand.SECONDARY;
const TRACK_INACTIVE_COLOR = SemanticColor.Button.SECONDARY;
const TRACK_SHADE_COLOR = SemanticColor.Background.OVERLAY;
const THUMB_COLOR = alwaysLight(SemanticColor.Background.SURFACE);
const THUMB_SHADOW_COLOR = SemanticColor.Background.OVERLAY;

export interface CoreJumboToggleViewModel {
  // Whether the toggle is on or off
  on: boolean;
  // 10 by default
  touchAreaExtension?: number;
  // Function to be called when the toggle is interacted with
  onTap?: () => void;
  // Accessibility setup for the toggle track's view
  accessibilityId?: string;
  // Able to disable the animation
  animationsEnabled?: boolean;
  // Whether or not the switch is disabled, disabling the switch also disables
  // tap/touch events
  disabled?: boolean;
  // Skips haptic feedback on toggle on change.
  hapticFeedbackDisabled?: boolean;
  /**
   * Toggle tints
   */
  // The color of the track when it is on. Override when needed
  trackOnColor?: SemanticColor;
  // The color of the track when it is off. Override when needed
  trackOffColor?: SemanticColor;
  // The color of the thumb when it is on. Override when needed
  thumbOnColor?: SemanticColor;
  // The color of the thumb when it is off. Override when needed
  thumbOffColor?: SemanticColor;
  /**
   * Toggle images
   */
  // The image to display (inside the toggle) when the toggle is on
  onImage?: Asset;
  // The image to display (inside the toggle) when the toggle is off
  offImage?: Asset;
  // The color of the image when the toggle is on
  onImageTintColor?: SemanticColor;
  // The color of the image when the toggle is off
  offImageTintColor?: SemanticColor;
}

interface State {
  on: boolean;
  pressed: boolean;
}

const baseStyle = {
  container: new Style<View>({
    height: 46,
    width: 88,
    accessibilityCategory: 'checkbox',
  }),
  trackContainer: new Style<Layout>({
    position: 'absolute',
    width: '100%',
    height: '100%',
  }),
  track: new Style<View>({
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    backgroundColor: TRACK_INACTIVE_COLOR,
  }),
  trackShade: new Style<View>({
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    backgroundColor: TRACK_SHADE_COLOR,
  }),
  thumbTrack: new Style<Layout>({
    width: '100%',
    height: '100%',
  }),
  thumbOuter: new Style<Layout>({
    position: 'absolute',
    left: 4,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  }),
  thumbInner: new Style<View>({
    height: 40,
    width: 40,
    borderRadius: '50%',
    backgroundColor: THUMB_COLOR,
    boxShadow: `0 1 3 ${THUMB_SHADOW_COLOR}`,
  }),
  onImage: new Style<View>({
    height: 15,
    width: 28,
    position: 'absolute',
    left: 10,
    right: undefined,
    top: 15,
    bottom: 10,
    justifyContent: 'center',
  }),
  offImage: new Style<View>({
    height: 15,
    width: 28,
    position: 'absolute',
    left: undefined,
    right: 10,
    top: 15,
    bottom: 10,
    justifyContent: 'center',
  }),
};

const onStyle = {
  ...baseStyle,
  track: baseStyle.track.extend({
    backgroundColor: TRACK_ACTIVE_COLOR,
  }),
  thumbOuter: baseStyle.thumbOuter.extend<Layout>({
    left: undefined,
    right: 4,
  }),
};

export class CoreJumboToggle extends StatefulComponent<CoreJumboToggleViewModel, State> {
  state = {
    pressed: false,
    on: false,
  };

  onViewModelUpdate(previous?: CoreJumboToggleViewModel): void {
    const viewModel = this.viewModel;
    if (previous && previous.on !== viewModel.on && viewModel.animationsEnabled !== false) {
      setTimeoutInterruptible(() => {
        if (!this.viewModel.hapticFeedbackDisabled) {
          Device.performHapticFeedback(DeviceHapticFeedbackType.ACTION_SHEET);
        }
        this.setStateAnimated(
          { on: viewModel.on },
          {
            stiffness: SPRING_DEFAULT_STIFFNESS,
            damping: SPRING_DEFAULT_DAMPING,
          },
        );
      });
    } else {
      this.setState({ on: viewModel.on });
    }
  }

  onRender(): void {
    const viewModel = this.viewModel ?? {};

    const on = this.state.on;
    const pressed = this.state.pressed;

    const style = on ? onStyle : baseStyle;
    const imageSrc = on ? viewModel.onImage : viewModel.offImage;

    const trackColor = on ? viewModel.trackOnColor : viewModel.trackOffColor;
    const thumbColor = on ? viewModel.thumbOnColor : viewModel.thumbOffColor;

    <view
      style={style.container}
      touchAreaExtension={this.viewModel.touchAreaExtension ?? 10}
      onTap={this.viewModel.onTap}
      onTouchStart={this.onTouchStart}
      onTouchEnd={this.onTouchEnd}
      accessibilityId={this.viewModel.accessibilityId}
      accessibilityStateSelected={on}
      opacity={this.viewModel.disabled ? 0.38 : undefined}
      touchEnabled={!this.viewModel.disabled}
    >
      <layout style={style.trackContainer}>
        <view style={style.track} backgroundColor={trackColor} />
        <view style={style.trackShade} opacity={pressed ? 0.5 : 0} />
      </layout>
      <layout style={style.thumbTrack}>
        {when(imageSrc !== null, () => {
          if (on) {
            <image style={style.onImage} src={imageSrc} tint={this.viewModel.onImageTintColor} />;
          } else {
            <image style={style.offImage} src={imageSrc} tint={this.viewModel.offImageTintColor} />;
          }
        })}
        <layout style={style.thumbOuter}>
          <view style={style.thumbInner} backgroundColor={thumbColor} />
        </layout>
      </layout>
    </view>;
  }

  private onTouchStart = (): void => {
    this.setStateAnimated({ pressed: true }, { duration: 0.15 });
  };

  private onTouchEnd = (): void => {
    this.setStateAnimated({ pressed: false }, { duration: 0.15 });
  };
}
