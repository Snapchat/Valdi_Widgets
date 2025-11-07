import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { AccessibilityPriority } from 'valdi_tsx/src/Accessibility';
import { ElementFrame } from 'valdi_tsx/src/Geometry';
import {
  Layout,
  LayoutAlignItemsProperty,
  LayoutJustifyContentProperty,
} from 'valdi_tsx/src/NativeTemplateElements';

interface State {
  readyToRender?: boolean;
  containerJustifyContent?: LayoutJustifyContentProperty;
  middleAlignItems?: LayoutAlignItemsProperty;
  middleLeftPadding?: number;
  middleRightPadding?: number;
}

/**
 * Subscreen header layout typical layout blueprint
 *
 * Is designed to be used inside of a <SubscreenHeader>
 * Allow injection of 3 element slots (left/middle/right)
 *
 * Note: consider using SubscreenHeaderTitle instead if possible
 */
export class SubscreenHeaderBlueprint extends StatefulComponent<{}, State> {
  static minHeight = 42;

  state: State = {};

  private widthContainer?: number;
  private widthMiddle?: number;
  private widthLeft?: number;
  private widthRight?: number;

  onRender(): void {
    <layout
      justifyContent={this.state.containerJustifyContent}
      style={dynamicStyles.container}
      onLayout={this.onLayoutContainer}
    >
      <view
        opacity={this.state.readyToRender ? 1 : 0}
        paddingLeft={this.state.middleLeftPadding}
        paddingRight={this.state.middleRightPadding}
        alignItems={this.state.middleAlignItems}
        onLayout={this.onLayoutMiddle}
        flexShrink={1}
      >
        <slot name={'middle'} />;
      </view>
      <layout style={dynamicStyles.left} onLayout={this.onLayoutLeft}>
        <slot name={'left'} />
      </layout>
      <layout style={dynamicStyles.right} onLayout={this.onLayoutRight}>
        <slot name={'right'} />
      </layout>
    </layout>;
  }

  private onLayoutContainer = (frame: ElementFrame): void => {
    this.widthContainer = frame.width;
    this.onLayoutDynamic();
  };
  private onLayoutMiddle = (frame: ElementFrame): void => {
    this.widthMiddle = frame.width;
    this.onLayoutDynamic();
  };
  private onLayoutLeft = (frame: ElementFrame): void => {
    this.widthLeft = frame.width;
    this.onLayoutDynamic();
  };
  private onLayoutRight = (frame: ElementFrame): void => {
    this.widthRight = frame.width;
    this.onLayoutDynamic();
  };

  private onLayoutDynamic(): void {
    const widthContainer = this.widthContainer;
    const widthMiddle = this.widthMiddle;
    const widthLeft = this.widthLeft;
    const widthRight = this.widthRight;
    if (widthContainer === undefined || widthMiddle === undefined) {
      return;
    }
    if (widthLeft === undefined || widthRight === undefined) {
      return;
    }
    const middleLeftPadding = this.state.middleLeftPadding ?? 0;
    const middleRightPadding = this.state.middleRightPadding ?? 0;
    const spacing = 10;
    const trueWidthMiddle = widthMiddle - middleLeftPadding - middleRightPadding;
    const trueWidthLeft = widthLeft + spacing;
    const trueWidthRight = widthRight + spacing;
    const halfMiddle = trueWidthMiddle / 2;
    const halfContainer = widthContainer / 2;
    const leftCollides = widthLeft && trueWidthLeft > halfContainer - halfMiddle - spacing;
    const rightCollides = widthRight && trueWidthRight > halfContainer - halfMiddle - spacing;
    if (leftCollides && rightCollides) {
      return this.setState({
        readyToRender: true,
        containerJustifyContent: 'center',
        middleAlignItems: 'center',
        middleLeftPadding: trueWidthLeft,
        middleRightPadding: trueWidthRight,
      });
    } else if (leftCollides) {
      return this.setState({
        readyToRender: true,
        containerJustifyContent: 'flex-start',
        middleAlignItems: 'flex-start',
        middleLeftPadding: trueWidthLeft,
        middleRightPadding: trueWidthRight,
      });
    } else if (rightCollides) {
      return this.setState({
        readyToRender: true,
        containerJustifyContent: 'flex-end',
        middleAlignItems: 'flex-end',
        middleLeftPadding: trueWidthLeft,
        middleRightPadding: trueWidthRight,
      });
    } else {
      return this.setState({
        readyToRender: true,
        containerJustifyContent: 'center',
        middleAlignItems: 'center',
        middleLeftPadding: 0,
        middleRightPadding: 0,
      });
    }
  }
}

const dynamicSide = new Style<Layout>({
  position: 'absolute',
  top: 0,
  bottom: 0,
  justifyContent: 'center',
});
const dynamicStyles = {
  container: new Style<Layout>({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: SubscreenHeaderBlueprint.minHeight,
  }),
  left: dynamicSide.extend({
    left: 0,
    alignItems: 'flex-start',
    accessibilityPriority: AccessibilityPriority.High,
  }),
  right: dynamicSide.extend({
    right: 0,
    alignItems: 'flex-end',
    accessibilityPriority: AccessibilityPriority.Low,
  }),
};
