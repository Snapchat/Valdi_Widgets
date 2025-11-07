import { Component } from 'valdi_core/src/Component';
import coreUiRes from 'widgets/res';
import { SubscreenHeaderButton } from 'widgets/src/components/subscreen/SubscreenHeaderButton';
import { SubscreenHeaderButtonCommonViewModel } from './SubscreenHeaderButtonCommonViewModel';

/**
 * A back button (arrow pointing left) typically rendered in the subscreen header title left slot.
 */
export class SubscreenHeaderButtonBack extends Component<SubscreenHeaderButtonCommonViewModel> {
  onRender(): void {
    <SubscreenHeaderButton
      image={coreUiRes.iconTitleDismiss}
      imageRotation={Math.PI / 2}
      imageHeight={11}
      imageWidth={18}
      onTap={this.viewModel.onTap}
      accessibilityId={this.viewModel.accessibilityId}
    />;
  }
}
