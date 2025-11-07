import { Asset } from 'valdi_core/src/Asset';
import { Component } from 'valdi_core/src/Component';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { CoreButton, CoreButtonColoring, CoreButtonSizing, CoreButtonWidths } from './CoreButton';

/**
 * PillButton is a subset of a CoreButton, we'll only expose the minimal interface
 */
export interface PillButtonViewModel {
  icon?: Asset;
  text?: string;
  loading?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onTap?: () => void;
  iconFlipRtl?: boolean;
  accessibilityId?: string;
  accessibilityLabel?: string;
}

export class PillButton extends Component<PillButtonViewModel> {
  onRender(): void {
    const viewModel = this.viewModel;
    // Simply render a regular configured CoreButton
    <CoreButton
      icon={viewModel.icon}
      text={viewModel.text}
      loading={viewModel.loading}
      disabled={viewModel.disabled}
      onTap={viewModel.onTap}
      iconFlipRtl={viewModel.iconFlipRtl}
      touchAreaExtension={4}
      accessibilityId={viewModel.accessibilityId}
      accessibilityLabel={viewModel.accessibilityLabel}
      sizing={CoreButtonSizing.SMALL}
      minWidth={CoreButtonWidths.DYNAMIC_SMALL_MINIMUM}
      coloring={viewModel.disabled ? CoreButtonColoring.INACTIVE : CoreButtonColoring.SECONDARY}
      foregroundColor={viewModel.selected ? SemanticColor.Button.PRIMARY : undefined}
    />;
  }
}
