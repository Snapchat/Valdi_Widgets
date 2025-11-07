import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { makeMainThreadCallback } from 'valdi_core/src/utils/FunctionUtils';
import { ElementFrame } from 'valdi_tsx/src/Geometry';
import { TouchEvent } from 'valdi_tsx/src/GestureEvents';
import { View, Color } from 'valdi_tsx/src/NativeTemplateElements';
import { SemanticColor } from 'widgets/src/styles/semanticColors';

interface ViewModel {
  initialValue?: number;
  onChange: (value: number) => void;
  lineEmptyColor?: Color | SemanticColor;
  lineFilledColor?: Color | SemanticColor;
  handleColor?: Color | SemanticColor;
  lineHeight?: number;
  handleSize?: number;

  callOnChangeOnMainThread?: boolean;
}

interface State {
  value: number;
  barWidth: number;
}

const BAR_SIZE = 25;
const DEFAULT_HANDLE_SIZE = 20;
const DEFAULT_LINE_HEIGHT = 4;

export class Slider extends StatefulComponent<ViewModel, State> {
  state: State = { value: 0, barWidth: 0 };

  onBarTouch = (event: TouchEvent): void => {
    const barWidth = this.state.barWidth;
    if (barWidth) {
      let ratio = event.x / barWidth;
      ratio = Math.max(Math.min(1.0, ratio), 0.0);

      if (this.state.value !== ratio) {
        this.setState({ value: ratio });
        this.viewModel.onChange(ratio);
      }
    }
  };

  // disabled due to needing to use this.onBarTouch
  // eslint-disable-next-line @typescript-eslint/member-ordering
  onBarTouchWrapped: (event: TouchEvent) => void = this.viewModel.callOnChangeOnMainThread
    ? makeMainThreadCallback(this.onBarTouch)
    : this.onBarTouch;

  onBarLayout = (frame: ElementFrame): void => {
    this.setState({ barWidth: frame.width });
  };

  onViewModelUpdate(): void {
    if (this.viewModel.initialValue !== undefined) {
      this.setState({ value: this.viewModel.initialValue });
    }
  }

  onRender(): void {
    <view style={styles.bar} onLayout={this.onBarLayout} onTouch={this.onBarTouchWrapped}>
      <view style={styles.line} height={this.viewModel.lineHeight ?? DEFAULT_LINE_HEIGHT}>
        <view
          style={styles.lineEmpty}
          backgroundColor={this.viewModel.lineEmptyColor ?? styles.color.emptyLine.backgroundColor}
        />
        <view
          style={styles.lineFilled}
          scaleX={this.state.value}
          translationX={-this.state.barWidth}
          backgroundColor={this.viewModel.lineFilledColor ?? styles.color.filledLine.backgroundColor}
        />
      </view>
      {this.renderHandle()}
    </view>;
  }

  private renderHandle(): void {
    const spaceWidth = this.state.barWidth - DEFAULT_HANDLE_SIZE;
    if (spaceWidth < 0) {
      return;
    }

    const barTranslation = spaceWidth * this.state.value;

    <view
      style={styles.handle}
      backgroundColor={this.viewModel.handleColor ?? styles.color.handle.backgroundColor}
      translationX={barTranslation}
      height={this.viewModel.handleSize ?? DEFAULT_HANDLE_SIZE}
      width={this.viewModel.handleSize ?? DEFAULT_HANDLE_SIZE}
    />;
  }
}

const styles = {
  bar: new Style<View>({
    height: BAR_SIZE,
    alignItems: 'center',
    flexDirection: 'row',
  }),
  line: new Style<View>({
    width: '100%',
    borderRadius: '50%',
    slowClipping: true,
  }),
  lineEmpty: new Style<View>({
    width: '100%',
    height: '100%',
    position: 'absolute',
  }),
  lineFilled: new Style<View>({
    width: '200%',
    height: '100%',
    position: 'absolute',
  }),
  color: {
    emptyLine: {
      backgroundColor: SemanticColor.Layout.INPUT_BORDER,
    },
    filledLine: {
      backgroundColor: SemanticColor.Layout.INPUT_BORDER_FOCUSED,
    },
    handle: {
      backgroundColor: SemanticColor.Layout.PLACEHOLDER,
    },
  },
  handle: new Style<View>({
    borderRadius: '50%',
    boxShadow: '0 0 1 rgba(0, 0, 0, 0.3)',
    position: 'absolute',
  }),
};
