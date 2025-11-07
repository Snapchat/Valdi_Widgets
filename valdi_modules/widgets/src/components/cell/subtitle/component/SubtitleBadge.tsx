import { Component } from 'valdi_core/src/Component';
import { CommonLabel, ViewAttributes } from 'valdi_tsx/src/NativeTemplateElements';
import { TextStyleFont } from 'widgets/src/styles/TextStyleFont';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { SubtitleText } from './SubtitleText';

export class SubtitleBadge extends Component<CommonLabel & ViewAttributes> {
  onRender(): void {
    <SubtitleText {...this.viewModel} font={TextStyleFont.CAPTION_EMPHASIS} color={SemanticColor.Button.PRIMARY} />;
  }
}
