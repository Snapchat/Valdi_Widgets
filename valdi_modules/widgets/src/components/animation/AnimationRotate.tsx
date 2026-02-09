import { AnimationCurve } from 'valdi_core/src/AnimationOptions';
import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { View } from 'valdi_tsx/src/NativeTemplateElements';

export interface AnimationRotateViewModel {
  // Control the speed of rotation: how many full 360deg rotation per second
  revolutionPerSecond: number;
  // Can add some static style to the rotating container view
  rotatingContainerStyle?: Style<View>;
}

interface AnimationRotateState {
  tick: number;
}

/**
 * Re-useable component to provide a permanently rotating view in which children can be injected
 */
export class AnimationRotate extends StatefulComponent<AnimationRotateViewModel, AnimationRotateState> {
  state: AnimationRotateState = {
    tick: 0,
  };

  private ticker?: number;

  onCreate(): void {
    const revolutionMs = 1000 / this.viewModel.revolutionPerSecond;
    // setInterval with explicit clearInterval in onDestroy (Valdi rule: prefer setTimeoutDisposable for one-shot; repeating tick kept here with cleanup).
    this.ticker = setInterval(() => {
      this.setStateAnimated(
        { tick: this.state.tick + 1 },
        { duration: revolutionMs / 1000, curve: AnimationCurve.Linear },
      );
    }, revolutionMs);
  }
  onDestroy(): void {
    clearInterval(this.ticker);
  }

  onRender(): void {
    const rotation = Math.PI * this.state.tick;
    <view style={this.viewModel.rotatingContainerStyle} rotation={rotation}>
      <slot />
    </view>;
  }
}
