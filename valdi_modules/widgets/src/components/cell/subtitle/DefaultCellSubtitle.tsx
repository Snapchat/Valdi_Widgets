import { Component } from 'valdi_core/src/Component';
import { Color, LabelValue } from 'valdi_tsx/src/NativeTemplateElements';
import { RenderFunction } from 'widgets/src/components/RenderFunction';
import { TextStyleFont } from 'widgets/src/styles/TextStyleFont';
import { CellPacking } from '../style';
import { DelimitedCellSubtitle } from './DelimitedCellSubtitle';
import { SubtitleText } from './component/SubtitleText';

export interface DefaultCellSubtitleViewModel {
  packing?: CellPacking;
  /** Accepts either a single subtitle string, or an array of strings to use as subtitle tokens, separated by a dot,
   * or an AttributedText array.
   */
  subtitle?: LabelValue;
  numSubtitleLines?: number;
  color?: Color;
  font?: TextStyleFont;
  /* accessory view for the subtitle text */
  children?: RenderFunction;
}

// If subtitle is not an attributed string, but is a string[], we want to delimit it with DelimitedCellSubtitle
// This method differenties between an array of string[] and an AttributedText styled array
function isDelimitedSubtitleArray(subtitle: LabelValue | undefined): subtitle is string[] {
  return Boolean(Array.isArray(subtitle) && subtitle.every(value => typeof value === 'string'));
}

/**
 * Provides default behavior for rendering cell subtitles.
 *
 * This includes text separated by a dot.
 */
export class DefaultCellSubtitle extends Component<DefaultCellSubtitleViewModel> {
  onRender(): void {
    const { subtitle, numSubtitleLines, color, packing, font } = this.viewModel;
    let subtitleArr: LabelValue[];
    if (isDelimitedSubtitleArray(subtitle)) {
      // Create a SubtitleText for each string
      subtitleArr = subtitle;
    } else if (subtitle) {
      // Treat as a single string or attributed string
      subtitleArr = [subtitle];
    } else {
      subtitleArr = [];
    }
    <DelimitedCellSubtitle
      packing={packing}
      renderFunction={subtitleArr.map(value => () => {
        <SubtitleText value={value} numberOfLines={numSubtitleLines} color={color} font={font} />;
      })}
      children={this.viewModel.children}
    />;
  }
}
