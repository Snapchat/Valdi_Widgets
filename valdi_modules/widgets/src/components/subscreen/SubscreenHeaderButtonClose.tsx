import { Component } from 'valdi_core/src/Component';
import coreUiRes from 'widgets/res';
import { SubscreenHeaderButton } from 'widgets/src/components/subscreen/SubscreenHeaderButton';
import { SubscreenHeaderButtonCommonViewModel } from './SubscreenHeaderButtonCommonViewModel';

/**
 * A close/dismiss button (X icon) typically rendered in the subscreen header title left slot.
 */
export class SubscreenHeaderButtonClose extends Component<SubscreenHeaderButtonCommonViewModel> {
  onRender(): void {
    <SubscreenHeaderButton
      image={coreUiRes.iconDismiss}
      imageHeight={16}
      imageWidth={16}
      onTap={this.viewModel.onTap}
      accessibilityId={this.viewModel.accessibilityId}
    />;
  }
}
