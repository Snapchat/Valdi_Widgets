import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { View } from 'valdi_tsx/src/NativeTemplateElements';
import res from 'widgets/res';
import { SemanticColor } from 'widgets/src/styles/semanticColors';

const styles = {
  checkbox: new Style<View>({
    width: '24',
    height: '24',
    borderRadius: '50%',
    borderColor: SemanticColor.Flat.PURE_BLACK,
    alignItems: 'center',
    justifyContent: 'center',
  }),
};

interface CheckboxViewModel {
  on: boolean;
  onTap: (state: boolean) => void;
  accessibilityId?: string;
  disabled?: boolean;
}

/**
 * @deprecated, consider using SelectorToggle or RadioToggle instead
 */
export class Checkbox extends Component<CheckboxViewModel> {
  get backgroundColor(): SemanticColor | undefined {
    if (this.viewModel.on) {
      return SemanticColor.Button.PRIMARY;
    }
    return;
  }

  get borderWidth(): number {
    if (this.viewModel.on) {
      return 0;
    }
    return 1;
  }

  onTap = (): void => {
    if (this.viewModel.disabled) {
      return;
    }
    this.viewModel.onTap(!this.viewModel.on);
  };

  onRender(): void {
    <view
      style={styles.checkbox}
      onTap={this.onTap}
      accessibilityId={this.viewModel.accessibilityId}
      backgroundColor={this.backgroundColor}
      borderWidth={this.borderWidth}
    >
      {this.onRenderTick()}
    </view>;
  }

  private onRenderTick(): void {
    if (this.viewModel.on) {
      <image src={res.iconTick} />;
    }
  }
}
