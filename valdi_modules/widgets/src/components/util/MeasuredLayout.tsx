import { StatefulComponent } from 'valdi_core/src/Component';
import { whenDefined } from 'valdi_core/src/utils/When';
import { ElementFrame } from 'valdi_tsx/src/Geometry';
import { Layout } from 'valdi_tsx/src/NativeTemplateElements';

export interface MeasuredLayoutViewModel extends Layout {
  children?: (frame: ElementFrame) => void;
}

/**
 * Layout that provides the frame measurements when rendering children. This is useful when the layout
 * uses flex or percentage-based sizing but the exact pixel dimensions are required for calculations by
 * the children
 *
 * @example
 * <MeasuredLayout width='50%' height='25%'>
 *   {$slot(({ width, height }) => {
 *     <view
 *       height={Math.min(width, height)}
 *       width={Math.min(width, height)}
 *       background='red'
 *     />;
 *   })}
 * </MeasuredLayout>
 */
export class MeasuredLayout extends StatefulComponent<MeasuredLayoutViewModel, ElementFrame | undefined> {
  onRender(): void {
    const { children: renderContent, ...layoutProps } = this.viewModel;
    <layout {...layoutProps} onLayout={this.onLayout}>
      {renderContent && whenDefined(this.state, renderContent)}
    </layout>;
  }

  private readonly onLayout = (frame: ElementFrame): void => this.setState(frame);
}
