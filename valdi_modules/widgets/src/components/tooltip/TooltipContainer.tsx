import { StatefulComponent } from 'valdi_core/src/Component';
import { Device } from 'valdi_core/src/Device';
import { Style } from 'valdi_core/src/Style';
import { ElementFrame } from 'valdi_tsx/src/Geometry';
import { LayoutJustifyContentProperty, Layout, Color } from 'valdi_tsx/src/NativeTemplateElements';
import { TooltipConstants } from './TooltipConstants';
import { TooltipInlined } from './TooltipInlined';
import { TooltipPosition } from './TooltipPosition';

/**
 * Maximum width that the tooltip is allowed to grow to
 */
export enum TooltipContainerSize {
  /**
   * Takes up to 2/3 of the width of the display
   */
  Large = 0.66,
  /**
   * Takes up to 2/5 of the width of the display
   */
  Small = 0.4,
}

export interface TooltipContainerViewModel {
  size?: TooltipContainerSize;
  on: boolean;
  text: string;
  position: TooltipPosition;
  /** when set, it will override the default maxNumberOfLines in TooltipInlined (3). */
  maxNumberOfLines?: number;
  onTap?: () => void;
  contactParentPositioning?: CustomPositioning;
  overrideBackgroundColor?: Color;
}

interface TooltipContainerState {
  contactParentPositioning?: CustomPositioning;
  contactChildPositioning?: CustomPositioning;
}

interface CustomPositioning {
  justifyContent?: LayoutJustifyContentProperty;
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
}

/**
 * This component behaves like a regular <layout/> element, except
 * it will correctly position and render a tooltip targeted at its content.
 * For example: this snippet will visually show a tooltip above a component:
 *
 * <TooltipContainer text="this is MyTooltipedComponent" position={TooltipPosition.TopCenter}>
 *    <MyTooltipedComponent/>
 * </TooltipContainer>
 *
 * Important Note 1: The tooltip will not reposition itself automatically to avoid occlusion:
 *  - make sure to pick a correct size/position that is not occluded by another element
 *  - and make sure to pick a correct size/position that will not overflow outside of the viewport
 *
 * Important Note2: The tooltip will not be able to overflow outside of the ValdiRootView or its parent view!
 */
export class TooltipContainer extends StatefulComponent<TooltipContainerViewModel, TooltipContainerState> {
  state: TooltipContainerState = {};

  private currentContainerFrame?: ElementFrame;
  private currentTooltipFrame?: ElementFrame;

  onRender(): void {
    const { on, text, position, size, onTap } = this.viewModel;
    const { contactParentPositioning, contactChildPositioning } = this.state;
    const visible = on && contactParentPositioning && contactChildPositioning;
    const tooltipSize = size ?? TooltipContainerSize.Large;
    const tooltipMaxWidth = Device.getDisplayWidth() * tooltipSize;
    <layout key='container' onLayout={this.onLayoutContainer}>
      <slot />
      <layout style={baseStyles.contactParentOrigin} {...this.state.contactParentPositioning}>
        <layout style={baseStyles.contactChildOrigin} {...this.state.contactChildPositioning} width={tooltipMaxWidth}>
          <layout key='tooltip' onLayout={this.onLayoutTooltip}>
            <TooltipInlined
              text={text}
              position={position}
              opacity={visible ? 1 : 0}
              onTap={onTap}
              maxNumberOfLines={this.viewModel.maxNumberOfLines}
              overrideBackgroundColor={this.viewModel.overrideBackgroundColor}
            />
          </layout>
        </layout>
      </layout>
    </layout>;
  }

  private onLayoutContainer = (frame: ElementFrame): void => {
    this.currentContainerFrame = frame;
    this.onLayoutUpdate();
  };

  private onLayoutTooltip = (frame: ElementFrame): void => {
    this.currentTooltipFrame = frame;
    this.onLayoutUpdate();
  };

  private onLayoutUpdate(): void {
    if (this.currentContainerFrame === undefined) {
      return undefined;
    }
    if (this.currentTooltipFrame === undefined) {
      return undefined;
    }
    const containerHalfWidth = this.currentContainerFrame.width / 2;
    const containerHalfHeight = this.currentContainerFrame.height / 2;
    const tooltipHalfWidth = this.currentTooltipFrame.width / 2;
    const tooltipHalfHeight = this.currentTooltipFrame.height / 2;
    switch (this.viewModel.position) {
      case TooltipPosition.BottomLeft: {
        return this.setState({
          contactParentPositioning: this.viewModel.contactParentPositioning ?? { bottom: 0, left: 0 },
          contactChildPositioning: { top: 0, right: -TooltipConstants.tailOverlap },
        });
      }
      case TooltipPosition.BottomRight: {
        return this.setState({
          contactParentPositioning: this.viewModel.contactParentPositioning ?? { bottom: 0, right: 0 },
          contactChildPositioning: { top: 0, left: -TooltipConstants.tailOverlap },
        });
      }
      case TooltipPosition.BottomCenter: {
        return this.setState({
          contactParentPositioning: this.viewModel.contactParentPositioning ?? { bottom: 0, left: containerHalfWidth },
          contactChildPositioning: { top: 0, left: -tooltipHalfWidth },
        });
      }
      case TooltipPosition.CenterLeft: {
        return this.setState({
          contactParentPositioning: this.viewModel.contactParentPositioning ?? { top: containerHalfHeight, left: 0 },
          contactChildPositioning: { top: -tooltipHalfHeight, right: 0 },
        });
      }
      case TooltipPosition.CenterRight: {
        return this.setState({
          contactParentPositioning: this.viewModel.contactParentPositioning ?? { top: containerHalfHeight, right: 0 },
          contactChildPositioning: { top: -tooltipHalfHeight, left: 0 },
        });
      }
      case TooltipPosition.TopLeft: {
        return this.setState({
          contactParentPositioning: this.viewModel.contactParentPositioning ?? { top: 0, left: 0 },
          contactChildPositioning: { justifyContent: 'flex-end', bottom: 0, right: -TooltipConstants.tailOverlap },
        });
      }
      case TooltipPosition.TopRight: {
        return this.setState({
          contactParentPositioning: this.viewModel.contactParentPositioning ?? { top: 0, right: 0 },
          contactChildPositioning: { justifyContent: 'flex-end', bottom: 0, left: -TooltipConstants.tailOverlap },
        });
      }
      case TooltipPosition.TopCenter: {
        return this.setState({
          contactParentPositioning: this.viewModel.contactParentPositioning ?? { top: 0, left: containerHalfWidth },
          contactChildPositioning: { justifyContent: 'flex-end', bottom: 0, right: -tooltipHalfWidth },
        });
      }
    }
  }
}

const baseStyles = {
  contactParentOrigin: new Style<Layout>({
    position: 'absolute',
    width: 0,
    height: 0,
    limitToViewport: false,
    ignoreParentViewport: true,
  }),
  contactChildOrigin: new Style<Layout>({
    position: 'absolute',
    limitToViewport: false,
    ignoreParentViewport: true,
  }),
};
