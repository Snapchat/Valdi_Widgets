import { Component } from 'valdi_core/src/Component';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { RuleViewModel } from './RuleViewModel';

/**
 * Full-height vertical divider line; defaults to 1pt width and the DIVIDER semantic color.
 */
export class VerticalRule extends Component<RuleViewModel> {
  onRender(): void {
    const color = this.viewModel?.color ?? SemanticColor.Layout.DIVIDER;
    const stroke = this.viewModel?.stroke ?? 1;
    <view backgroundColor={color} width={stroke} height='100%' />;
  }
}
