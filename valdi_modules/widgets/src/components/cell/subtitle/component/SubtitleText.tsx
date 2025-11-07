import { Component } from 'valdi_core/src/Component';
import { CommonLabel, CommonTextAttributes, ViewAttributes } from 'valdi_tsx/src/NativeTemplateElements';
import { style } from '../../style';

export class SubtitleText extends Component<CommonTextAttributes & ViewAttributes & CommonLabel> {
  onRender(): void {
    <label {...this.viewModel} accessibilityId='result-subtitle' style={style.label.subtitle} />;
  }
}
