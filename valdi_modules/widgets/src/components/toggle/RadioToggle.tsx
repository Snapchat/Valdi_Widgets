import { StatefulComponent } from 'valdi_core/src/Component';
import { setTimeoutInterruptible } from 'valdi_core/src/SetTimeout';
import { Style } from 'valdi_core/src/Style';
import { View } from 'valdi_tsx/src/NativeTemplateElements';
import { SemanticColor } from 'widgets/src/styles/semanticColors';

const OUTER_INACTIVE_COLOR = SemanticColor.Icon.SECONDARY;
const OUTER_ACTIVE_COLOR = SemanticColor.Brand.SECONDARY;
const INNER_COLOR = SemanticColor.Background.SURFACE;

const OUTER_SIZE = 24;
const ANIMATION_DURATION = 0.2;

export interface RadioToggleViewModel {
  on: boolean;
  accessibilityId?: string;
  animationsEnabled?: boolean;
  onTap?: () => void;
}

interface RadioToggleState {
  on: boolean;
}

export class RadioToggle extends StatefulComponent<RadioToggleViewModel, RadioToggleState> {
  state: RadioToggleState = {
    on: false,
  };

  onViewModelUpdate(previous?: RadioToggleViewModel): void {
    const viewModel = this.viewModel;
    if (previous && viewModel.animationsEnabled !== false) {
      setTimeoutInterruptible(() => {
        this.setStateAnimated({ on: viewModel.on }, { duration: ANIMATION_DURATION });
      });
    } else {
      this.setState({ on: viewModel.on });
    }
  }

  onRender(): void {
    const active = this.state.on;
    const innerSize = active ? 10 : OUTER_SIZE - 2;
    const outerColor = active ? OUTER_ACTIVE_COLOR : OUTER_INACTIVE_COLOR;
    <view
      style={styles.outer}
      backgroundColor={outerColor}
      onTap={this.viewModel.onTap}
      accessibilityId={this.viewModel.accessibilityId}
      accessibilityStateSelected={active}
    >
      <view style={styles.inner} width={innerSize} height={innerSize} borderRadius={innerSize / 2} />
    </view>;
  }
}

const styles = {
  outer: new Style<View>({
    width: OUTER_SIZE,
    height: OUTER_SIZE,
    borderRadius: OUTER_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    accessibilityCategory: 'radio',
  }),
  inner: new Style<View>({
    backgroundColor: INNER_COLOR,
  }),
};
