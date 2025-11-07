import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { Label, Layout, ImageView } from 'valdi_tsx/src/NativeTemplateElements';
import { TextStyleFont } from 'widgets/src/styles/TextStyleFont';
import { SemanticColor } from '../../../styles/semanticColors';

export interface SectionHeaderLabelViewModel {
  text: string;
  iconUrl: string;
}

/**
 * An icon followed by a text label to be used in the 'Action Button' position of SectionHeader.
 */
export class SectionHeaderLabel extends Component<SectionHeaderLabelViewModel> {
  onRender(): void {
    const { iconUrl, text } = this.viewModel;
    <layout style={style.iconLabel}>
      <image src={iconUrl} style={style.icon} />
      <label value={text} style={style.label} />
    </layout>;
  }
}

const style = {
  label: new Style<Label>({
    font: TextStyleFont.SUBHEADLINE_EMPHASIS,
    color: SemanticColor.Text.TERTIARY,
  }),

  icon: new Style<ImageView>({
    tint: SemanticColor.Text.TERTIARY,
    width: 19,
    height: 19,
  }),

  iconLabel: new Style<Layout>({
    flexDirection: 'row',
    flexGrow: 0,
  }),
};
