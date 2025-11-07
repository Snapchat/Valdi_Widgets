import { AnimationCurve } from 'valdi_core/src/AnimationOptions';
import { StatefulComponent } from 'valdi_core/src/Component';
import { setTimeoutInterruptible } from 'valdi_core/src/SetTimeout';

export interface VerticallyOpenableComponentViewModel {
  isOpened: boolean;
  duration?: number;
  overflow?: 'visible' | 'scroll';

  onOpen?: VoidFunction;
  onOpened?: VoidFunction;
  onClose?: VoidFunction;
  onClosed?: VoidFunction;
}

interface VerticallyOpenableComponentState {
  height?: number;
  animating: boolean;
}

/* A component that performs vertical height animations when opening and closing its content */
export class VerticallyOpenableComponent extends StatefulComponent<
  VerticallyOpenableComponentViewModel,
  VerticallyOpenableComponentState
> {
  state: VerticallyOpenableComponentState = {
    height: this.targetHeight,
    animating: false,
  };

  private timer?: number;
  private defaultDuration = 0.3;

  // When opened, height is set to undefined to allow it to grow to the height of its child
  private get targetHeight(): number | undefined {
    return this.viewModel.isOpened ? undefined : 0;
  }

  onViewModelUpdate(previousViewModel?: VerticallyOpenableComponentViewModel): void {
    if (!previousViewModel || this.viewModel.isOpened === previousViewModel.isOpened) {
      return;
    }
    clearTimeout(this.timer);
    this.timer = setTimeoutInterruptible(() => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.setStateAnimatedPromise(
        { height: this.targetHeight, animating: true },
        {
          duration: this.viewModel.duration ?? this.defaultDuration,
          curve: this.viewModel.isOpened ? AnimationCurve.EaseIn : AnimationCurve.EaseOut,
        },
      ).then(() => {
        this.setState({ animating: false });
        this.viewModel.isOpened ? this.viewModel.onOpened?.() : this.viewModel.onClosed?.();
      });
    });
    this.viewModel.isOpened ? this.viewModel.onOpen?.() : this.viewModel.onClose?.();
  }
  onRender(): void {
    // slowClipping is used to prevent contents from vertically overflowing during animation
    <view
      height={this.state.height}
      slowClipping={this.state.animating}
      overflow={this.viewModel.overflow ?? 'visible'}
    >
      <slot />
    </view>;
  }

  onDestroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}
