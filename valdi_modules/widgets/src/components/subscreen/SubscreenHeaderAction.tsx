import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { Label } from 'valdi_tsx/src/NativeTemplateElements';
import { TextStyleFont } from 'widgets/src/styles/TextStyleFont';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { Spacing } from 'widgets/src/styles/spacing';

export interface SubscreenHeaderActionViewModel {
  text: string;
  touchAreaExtension?: number;
  onTap?: () => void;
  accessibilityId?: string;
}

/**
 * Subscreen header action text, typically added inside of a Subscreen title's left/right slot
 */
export class SubscreenHeaderAction extends Component<SubscreenHeaderActionViewModel> {
  onRender(): void {
    const viewModel = this.viewModel ?? {};
    const text = viewModel.text;
    const touchAreaExtension = viewModel.touchAreaExtension ?? Spacing.SM;
    const onTap = viewModel.onTap;
    const accessibilityId = viewModel.accessibilityId;
    <label
      style={styles.label}
      value={text}
      touchAreaExtension={touchAreaExtension}
      onTap={onTap}
      accessibilityId={accessibilityId}
    />;
  }
}

const styles = {
  label: new Style<Label>({
    font: TextStyleFont.BODY,
    color: SemanticColor.Text.SECONDARY,
    textAlign: 'center',
    maxHeight: '100%',
    maxWidth: '100%',
  }),
};
