import { Application } from 'valdi_core/src/Application';
import { ApplicationCancelable } from 'valdi_core/src/ApplicationBridge';
import { StatefulComponent } from 'valdi_core/src/Component';

const ANIMATION_IN_DURATION = 0.3;
const ANIMATION_OUT_DURATION = 0.2;

export interface WithKeyboardPaddingViewModel {
  enabled?: boolean;
  animated?: boolean;
  paddingOffset?: number;
}

interface WithKeyboardPaddingState {
  keyboardHeight: number;
}

/**
 * This class can be used to add vertical spacing equivalent to the size of the keyboard,
 * this is useful for example for floating interfaces that needs to remain above the keyboard's UI
 */
export class WithKeyboardPadding extends StatefulComponent<WithKeyboardPaddingViewModel, WithKeyboardPaddingState> {
  state: WithKeyboardPaddingState = {
    keyboardHeight: Application.getKeyboardHeight(),
  };

  private keyboardLastHeight: number = this.state.keyboardHeight;
  private keyboardCancelable?: ApplicationCancelable;

  onCreate(): void {
    this.keyboardCancelable = Application.observeKeyboardHeight((keyboardHeight: number) => {
      const animated = this.viewModel.animated ?? true;
      if (animated) {
        const opening = keyboardHeight > this.keyboardLastHeight;
        const duration = opening ? ANIMATION_IN_DURATION : ANIMATION_OUT_DURATION;
        this.setStateAnimated({ keyboardHeight: keyboardHeight }, { duration: duration });
      } else {
        this.setState({ keyboardHeight: keyboardHeight });
      }
      this.keyboardLastHeight = keyboardHeight;
    });
  }

  onDestroy(): void {
    this.keyboardCancelable?.cancel();
  }

  onRender(): void {
    const enabled = this.viewModel.enabled ?? true;
    const keyboardHeightOffset = this.viewModel.paddingOffset ?? 0;
    <layout paddingBottom={enabled ? Math.max(0, this.state.keyboardHeight + keyboardHeightOffset) : undefined}>
      <slot />
    </layout>;
  }
}
