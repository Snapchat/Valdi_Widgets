import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { ElementFrame } from 'valdi_tsx/src/Geometry';
import { View } from 'valdi_tsx/src/NativeTemplateElements';
import { GradientDirection, linearGradient } from 'widgets/src/styles/gradients';
import { SemanticColor } from 'widgets/src/styles/semanticColorsGen';
import { ScrollViewHandler } from '../scroll/ScrollViewHandler';

interface DataSyncingBarState {
  width: number;
}

const SCROLL_SPEED_INCREMENT = 10;
const GRADIENT = linearGradient(
  [
    [SemanticColor.Base.APP_YELLOW, 0],
    [SemanticColor.Base.APP_YELLOW, 0.9 / 4],
    [SemanticColor.Flat.PURE_WHITE, 1 / 4],
    [SemanticColor.Brand.PRIMARY, 1.7 / 4],
    [SemanticColor.Base.APP_YELLOW, 2.0 / 4],
    [SemanticColor.Base.APP_YELLOW, 2.9 / 4],
    [SemanticColor.Flat.PURE_WHITE, 3 / 4],
    [SemanticColor.Brand.PRIMARY, 3.7 / 4],
    [SemanticColor.Base.APP_YELLOW, 4.0 / 4],
  ],
  GradientDirection.LeftToRight,
);

export class DataSyncingBar extends StatefulComponent<{}, DataSyncingBarState> {
  state = {
    width: 0,
  };

  private disposable: number | null = null;
  private scrollProgress: number = 0;

  private readonly scrollViewHandler = new ScrollViewHandler();

  onCreate(): void {
    this.disposable = this.setTimeoutDisposable(this.scroll, 5);
  }

  onDestroy(): void {
    if (this.disposable) {
      clearTimeout(this.disposable);
    }
  }
  onRender(): void {
    <scroll
      horizontal
      style={styles.bar}
      showsHorizontalScrollIndicator={false}
      ref={this.scrollViewHandler}
      bounces={false}
      circularRatio={2}
      scrollEnabled={false}
      onLayout={this.setWidth}
    >
      <view style={styles.gradient} width={this.getMaxWidth()} background={GRADIENT} />
    </scroll>;
  }

  getMaxWidth(): number {
    return this.state.width * 4;
  }

  setWidth = (frame: ElementFrame): void => {
    this.setState({ width: frame.width });
  };

  scroll = (): void => {
    this.scrollProgress = this.scrollProgress + SCROLL_SPEED_INCREMENT;
    // automatically updates scroll offset every 10ms, so that animations aren't necessary
    this.scrollViewHandler.scrollTo(this.scrollProgress, 0, false);
    this.disposable = this.setTimeoutDisposable(this.scroll, 10);
  };
}

const styles = {
  bar: new Style<View>({
    height: '100%',
  }),
  gradient: new Style<View>({
    height: '100%',
  }),
};
