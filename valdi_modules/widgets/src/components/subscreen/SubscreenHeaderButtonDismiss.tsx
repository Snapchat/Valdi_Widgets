import { Component } from 'valdi_core/src/Component';
import coreUiRes from 'widgets/res';
import { SubscreenHeaderButton } from 'widgets/src/components/subscreen/SubscreenHeaderButton';
import { SubscreenHeaderButtonCommonViewModel } from './SubscreenHeaderButtonCommonViewModel';

/**
 * A dismiss button (downward chevron) typically rendered in the subscreen header title left slot.
 */
export class SubscreenHeaderButtonDismiss extends Component<SubscreenHeaderButtonCommonViewModel> {
  onRender(): void {
    <SubscreenHeaderButton
      image={coreUiRes.iconTitleDismiss}
      imageHeight={11}
      imageWidth={18}
      onTap={this.viewModel.onTap}
      accessibilityId={this.viewModel.accessibilityId}
    />;
  }
}
