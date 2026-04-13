import { Component } from 'valdi_core/src/Component';
import { CommonLabel, CommonTextAttributes, ViewAttributes } from 'valdi_tsx/src/NativeTemplateElements';
import { style } from '../../style';

/**
 * Base subtitle label that applies the shared cell subtitle style; used directly or via SubtitleBadge/SubtitleBrand.
 */
export class SubtitleText extends Component<CommonTextAttributes & ViewAttributes & CommonLabel> {
  onRender(): void {
    <label {...this.viewModel} accessibilityId='result-subtitle' style={style.label.subtitle} />;
  }
}
