import { AnimationOptions } from 'valdi_core/src/AnimationOptions';
import { StatefulComponent } from 'valdi_core/src/Component';
import { setTimeoutInterruptible } from 'valdi_core/src/SetTimeout';
import { Style } from 'valdi_core/src/Style';
import { lerp } from 'foundation/src/number';
import { View } from 'valdi_tsx/src/NativeTemplateElements';

export interface AnimationSlidingViewModel {
  delayMs: number;

  startX?: number;
  startY?: number;

  endX?: number;
  endY?: number;

  style?: Style<View>;

  animationOptions: AnimationOptions;
}

interface AnimationSlidingState {
  progress: number;
}

export class AnimationSliding extends StatefulComponent<AnimationSlidingViewModel, AnimationSlidingState> {
  state: AnimationSlidingState = {
    progress: 0,
  };

  private timer?: number;

  onCreate(): void {
    const delayMs = this.viewModel?.delayMs;
    this.timer = setTimeoutInterruptible(() => {
      this.setStateAnimated({ progress: 1 }, this.viewModel.animationOptions);
    }, delayMs);
  }
  onDestroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  onRender(): void {
    // Compute the scale and progress
    const progress = this.state.progress;
    const currentX = lerp(this.viewModel?.startX ?? 0, this.viewModel?.endX ?? 0, progress);
    const currentY = lerp(this.viewModel?.startY ?? 0, this.viewModel?.endY ?? 0, progress);
    // We need to use a view since layout do not accept translate
    <view style={this.viewModel.style} translationX={currentX} translationY={currentY}>
      <slot />
    </view>;
  }
}
