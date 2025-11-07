import { Component } from 'valdi_core/src/Component';
import { CSSValue } from 'valdi_tsx/src/NativeTemplateElements';
import { Spacing } from 'widgets/src/styles/spacing';

export interface SectionSeparatorViewModel {
  spacing?: CSSValue;
}

export class SectionSeparator extends Component<SectionSeparatorViewModel> {
  onRender(): void {
    const { spacing = Spacing.MD } = this.viewModel; // Standardized value, taken from SearchV2 production value and applied to all features
    <layout height={spacing} />;
  }
}
