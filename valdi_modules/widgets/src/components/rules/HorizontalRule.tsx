import { Component } from 'valdi_core/src/Component';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { RuleViewModel } from './RuleViewModel';

/**
 * Full-width horizontal divider line; defaults to 1pt height and the DIVIDER semantic color.
 */
export class HorizontalRule extends Component<RuleViewModel> {
  onRender(): void {
    const color = this.viewModel?.color ?? SemanticColor.Layout.DIVIDER;
    const stroke = this.viewModel?.stroke ?? 1;
    <view backgroundColor={color} height={stroke} width='100%' />;
  }
}
