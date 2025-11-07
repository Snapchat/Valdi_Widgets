import { StatefulComponent } from 'valdi_core/src/Component';
import { whenDefined } from 'valdi_core/src/utils/When';
import { ElementFrame } from 'valdi_tsx/src/Geometry';
import { View } from 'valdi_tsx/src/NativeTemplateElements';

export interface MeasuredViewModel extends View {
  children?: (frame: ElementFrame) => void;
}

/**
 * View that provides the frame measurements when rendering children. This is useful when the layout
 * uses flex or percentage-based sizing but the exact pixel dimensions are required for calculations by
 * the children
 *
 * @example
 * <MeasuredView width='50%' height='25%'>
 *   {$slot(({ width, height }) => {
 *     <view
 *       height={Math.min(width, height)}
 *       width={Math.min(width, height)}
 *       background='red'
 *     />;
 *   })}
 * </MeasuredView>
 */
export class MeasuredView extends StatefulComponent<MeasuredViewModel, ElementFrame | undefined> {
  onRender(): void {
    const { children: renderContent, ...viewProps } = this.viewModel;
    <view {...viewProps} onLayout={this.onLayout}>
      {renderContent && whenDefined(this.state, renderContent)}
    </view>;
  }

  private readonly onLayout = (frame: ElementFrame): void => this.setState(frame);
}
