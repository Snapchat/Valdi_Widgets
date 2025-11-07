import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { DragEvent } from 'valdi_tsx/src/GestureEvents';
import { Layout, CSSValue } from 'valdi_tsx/src/NativeTemplateElements';
import { VerticalSplitSeparator } from './VerticalSplitSeparator';

interface ViewModel {
  height?: CSSValue;
  leftWidth?: CSSValue;
  rightWidth?: CSSValue;
  canShrinkLeft?: boolean;
  canShrinkRight?: boolean;
  canGrowLeft?: boolean;
  canGrowRight?: boolean;
  resizable?: boolean;
  onDragSeparator?: (event: DragEvent) => void;
}

export enum VerticalSplitViewSlots {
  Left = 'Left',
  Right = 'Right',
}

export class VerticalSplitView extends Component<ViewModel> {
  onRender() {
    const {
      canShrinkRight,
      canGrowRight,
      canShrinkLeft,
      canGrowLeft,
      leftWidth,
      rightWidth,
      resizable,
      height,
      onDragSeparator,
    } = this.viewModel;

    <view flexDirection='row' height={height}>
      <layout
        style={styles.section}
        flexShrink={canShrinkLeft ? 1 : undefined}
        flexGrow={canGrowLeft ? 1 : undefined}
        width={leftWidth}
      >
        <slot name={VerticalSplitViewSlots.Left} />
      </layout>
      <VerticalSplitSeparator resizable={resizable} onDragSeparator={onDragSeparator} />
      <layout
        style={styles.section}
        flexShrink={canShrinkRight ? 1 : undefined}
        flexGrow={canGrowRight ? 1 : undefined}
        width={rightWidth}
      >
        <slot name={VerticalSplitViewSlots.Right} />
      </layout>
    </view>;
  }
}

const styles = {
  section: new Style<Layout>({
    justifyContent: 'space-evenly',
  }),
};
