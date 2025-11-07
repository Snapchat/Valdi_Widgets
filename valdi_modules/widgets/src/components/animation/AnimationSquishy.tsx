import { AnimationOptions } from 'valdi_core/src/AnimationOptions';
import { StatefulComponent } from 'valdi_core/src/Component';
import { setTimeoutInterruptible } from 'valdi_core/src/SetTimeout';
import { Style } from 'valdi_core/src/Style';
import { View } from 'valdi_tsx/src/NativeTemplateElements';

export interface AnimationSquishyViewModel {
  delayMs: number;

  tiltX?: number;
  tiltY?: number;

  style?: Style<View>;

  direction: 'grow' | 'shrink';

  animationOptions: AnimationOptions;
}

interface AnimationSquishyState {
  progress: number;
}

export class AnimationSquishy extends StatefulComponent<AnimationSquishyViewModel, AnimationSquishyState> {
  state: AnimationSquishyState = {
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
    const growing = this.viewModel.direction === 'grow';
    const progress = this.state.progress;
    const scale = growing ? progress : 1 - progress;
    const inverse = 1 - scale;
    const tiltX = this.viewModel?.tiltX ?? 0;
    const tiltY = this.viewModel?.tiltY ?? 0;
    // We need to use a view since layout do not accept translate and scale
    <view
      style={this.viewModel.style}
      scaleX={scale}
      scaleY={scale}
      translationX={inverse * tiltX}
      translationY={inverse * tiltY}
    >
      <slot />
    </view>;
  }
}
