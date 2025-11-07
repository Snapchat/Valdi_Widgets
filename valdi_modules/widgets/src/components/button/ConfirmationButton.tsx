import { Component } from 'valdi_core/src/Component';
import { CoreButton, CoreButtonColoring, CoreButtonSizing, CoreButtonWidths } from './CoreButton';

/**
 * ConfirmationButton is a subset of a CoreButton, we'll only expose the minimal interface
 */
export interface ConfirmationButtonViewModel {
  text?: string;
  loading?: boolean;
  disabled?: boolean;
  onTap?: () => void;
  accessibilityId?: string;
  accessibilityLabel?: string;
}

export class ConfirmationButton extends Component<ConfirmationButtonViewModel> {
  onRender(): void {
    const viewModel = this.viewModel;
    // Simply render a regular configured CoreButton
    <CoreButton
      text={viewModel.text}
      loading={viewModel.loading}
      disabled={viewModel.disabled}
      onTap={viewModel.onTap}
      accessibilityId={viewModel.accessibilityId}
      accessibilityLabel={viewModel.accessibilityLabel}
      sizing={CoreButtonSizing.XL}
      width={CoreButtonWidths.FIXED_XL_212}
      coloring={viewModel.disabled ? CoreButtonColoring.INACTIVE : CoreButtonColoring.PRIMARY}
    />;
  }
}
