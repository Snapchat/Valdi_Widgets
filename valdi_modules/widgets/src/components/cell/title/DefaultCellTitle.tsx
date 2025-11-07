import { Component } from 'valdi_core/src/Component';
import { ElementRef } from 'valdi_core/src/ElementRef';
import { CommonLabel, LabelValue } from 'valdi_tsx/src/NativeTemplateElements';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { style } from '../style';

export interface DefaultCellTitleViewModel {
  title: LabelValue;
  numTitleLines?: number;
  labelStyleOverride?: CommonLabel;
  textColor?: SemanticColor;
  backgroundColor?: SemanticColor;
  font?: string;
}

/**
 * Provides default behavior for rendering cell titles.
 */
export class DefaultCellTitle extends Component<DefaultCellTitleViewModel> {
  titleAccessoryRef = new ElementRef();

  onCreate(): void {
    this.titleAccessoryRef.setAttribute('marginRight', 6);
    this.titleAccessoryRef.setAttribute('marginLeft', 5); // spacing to match native
  }

  onRender(): void {
    const viewModel = this.viewModel ?? {};
    const title = viewModel.title;
    const titleLines = viewModel.numTitleLines ?? 1;
    <layout style={style.container.title}>
      <label
        accessibilityId='result-title'
        style={style.label.title}
        font={viewModel.font}
        color={viewModel.textColor}
        backgroundColor={this.viewModel.backgroundColor}
        numberOfLines={titleLines}
        value={title}
        {...viewModel.labelStyleOverride}
      />
      <slot name='accessory-title' ref={this.titleAccessoryRef} />
    </layout>;
  }
}
