import { LabelTextDecoration } from 'valdi_tsx/src/NativeTemplateElements';
import { SemanticColor } from 'widgets/src/styles/semanticColors';

export interface TextWithTagsStyle {
  /**
   * Text styling
   */
  font?: string;
  color?: SemanticColor;
  textDecoration?: LabelTextDecoration;
  letterSpacing?: number;
  /**
   * Text event when user taps this portion of the text
   */
  onTap?: () => void;
  /**
   * The accessibility id of the label (used for karma tests)
   */
  accessibilityId?: string;
}
