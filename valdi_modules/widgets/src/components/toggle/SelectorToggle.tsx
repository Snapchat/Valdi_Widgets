import { StatefulComponent } from 'valdi_core/src/Component';
import { setTimeoutInterruptible } from 'valdi_core/src/SetTimeout';
import { Style } from 'valdi_core/src/Style';
import { View } from 'valdi_tsx/src/NativeTemplateElements';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import res from '../../../res';

const OUTER_INACTIVE_COLOR = SemanticColor.Icon.SECONDARY;
const INNER_INACTIVE_COLOR = SemanticColor.Background.SURFACE;
const INNER_ACTIVE_COLOR = SemanticColor.Brand.SECONDARY;
const ICON_ACTIVE_COLOR = SemanticColor.Background.SURFACE;

const OUTER_SIZE = 24;
const ANIMATION_DURATION = 0.2;

export interface SelectorToggleViewModel {
  on: boolean;
  accessibilityId?: string;
  animationsEnabled?: boolean;
  onTap?: () => void;
  borderColor?: SemanticColor;
  iconColor?: SemanticColor;
  onBackgroundColor?: SemanticColor;
  offBackgroundColor?: SemanticColor;
}

interface SelectorToggleState {
  on: boolean;
}

export class SelectorToggle extends StatefulComponent<SelectorToggleViewModel, SelectorToggleState> {
  state: SelectorToggleState = {
    on: false,
  };

  onViewModelUpdate(previous?: SelectorToggleViewModel): void {
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
    const viewModel = this.viewModel;

    const active = this.state.on;
    const innerSrc = active ? res.iconValidated : undefined;
    // layout / coloring vars
    const activeIconColor = viewModel.iconColor ?? ICON_ACTIVE_COLOR;
    const activeBackgroundColor = viewModel.onBackgroundColor ?? INNER_ACTIVE_COLOR;
    const inactiveBackgroundColor = viewModel.offBackgroundColor ?? INNER_INACTIVE_COLOR;
    const inactiveBorderColor = viewModel.borderColor ?? OUTER_INACTIVE_COLOR;
    const innerTint = active ? activeIconColor : undefined;
    const innerSize = active ? 16 : OUTER_SIZE - 2;
    const backgroundColor = active ? activeBackgroundColor : inactiveBackgroundColor;

    <view
      style={styles.outer}
      backgroundColor={backgroundColor}
      onTap={viewModel.onTap}
      accessibilityId={viewModel.accessibilityId}
      borderColor={active ? undefined : inactiveBorderColor}
      borderWidth={active ? undefined : 1}
      accessibilityStateSelected={active}
    >
      <image src={innerSrc} tint={innerTint} width={innerSize} height={innerSize} borderRadius={innerSize / 2} />
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
    accessibilityCategory: 'checkbox',
  }),
};
