import { Component } from 'valdi_core/src/Component';
import { when } from 'valdi_core/src/utils/When';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { RenderFunction } from '../../RenderFunction';
import { CellPacking, packingSubtitleMinHeights, style, SUBTITLE_DELIMITER } from '../style';

export interface GenericCellSubtitleViewModel {
  singleLine?: boolean;
  packing?: CellPacking;
  delimiterColor?: SemanticColor;
  renderFunction?: RenderFunction | RenderFunction[];
  /* accessory view for the subtitle text */
  children?: RenderFunction;
}

export class DelimitedCellSubtitle extends Component<GenericCellSubtitleViewModel> {
  onRender(): void {
    const viewModel = this.viewModel ?? {};
    const renderFunction = !Array.isArray(viewModel.renderFunction) && viewModel.renderFunction;
    const renderFunctionArray = Array.isArray(viewModel.renderFunction) && viewModel.renderFunction;
    const packing = viewModel.packing ?? CellPacking.Large70;
    const packingSubtitleMinHeight = packingSubtitleMinHeights[packing];

    <layout style={style.container.subtitle} minHeight={packingSubtitleMinHeight}>
      {/* Subtitle Accessory */}
      {when(this.viewModel.children, children => {
        <layout marginRight={6} alignSelf='flex-start'>
          {children()}
        </layout>;
      })}
      {/* Subtitle Block */}
      {(() => {
        if (renderFunction) {
          renderFunction();
        } else if (renderFunctionArray) {
          <layout style={viewModel.singleLine ? style.container.nonWrappable : style.container.wrappable}>
            {renderFunctionArray.forEach((renderFunctionItem: RenderFunction, index: number) => {
              if (index > 0) {
                <label style={style.label.delimiter} color={viewModel.delimiterColor} value={SUBTITLE_DELIMITER} />;
              }
              renderFunctionItem();
            })}
          </layout>;
        }
      })()}
    </layout>;
  }
}
